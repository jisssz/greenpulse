import os
# Force CPU-only mode to prevent loading heavy CUDA libraries and save 150MB+ RAM
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import io
import json
import base64
import numpy as np
import tensorflow as tf
# Optimize TensorFlow for Render Free Tier (512MB RAM limit) to prevent OOM crashes
tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

app = FastAPI(title="GreenPulse AI Environmental Intelligence Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-nine-woad-g8xvq6ys3s.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLASSES = [
    "Plastic",
    "Paper",
    "Glass",
    "Metal",
    "Organic Waste",
    "Electronic Waste",
    "Hazardous Waste"
]

CLASS_METADATA = {
    "Plastic": {
        "recyclable": True,
        "recommended_bin": "Blue Bin",
        "environmental_score": 85,
        "material_type": "PET / HDPE Plastic",
        "condition": "Clean / Recyclable",
        "recommended_action": "Rinse off residual liquids and place in the Blue recycling bin."
    },
    "Paper": {
        "recyclable": True,
        "recommended_bin": "Green Bin",
        "environmental_score": 75,
        "material_type": "Cellulose Fiber / Paperboard",
        "condition": "Dry / Recyclable",
        "recommended_action": "Ensure paper is dry, flatten cardboard, and place in the Green paper bin."
    },
    "Glass": {
        "recyclable": True,
        "recommended_bin": "Yellow Bin",
        "environmental_score": 70,
        "material_type": "Soda-Lime Glass",
        "condition": "Intact / Recyclable",
        "recommended_action": "Rinse glass bottles/jars and discard in the Yellow glass bin. Handle broken glass with care."
    },
    "Metal": {
        "recyclable": True,
        "recommended_bin": "Red Bin",
        "environmental_score": 80,
        "material_type": "Aluminium / Steel",
        "condition": "Crushed / Recyclable",
        "recommended_action": "Compress cans to save space and drop them in the Red metal receptacle."
    },
    "Organic Waste": {
        "recyclable": True,
        "recommended_bin": "Compost Bin",
        "environmental_score": 90,
        "material_type": "Bio-degradable Organic Matter",
        "condition": "Compostable",
        "recommended_action": "Transfer food scraps, peels, or garden trimmings directly into the Compost bin."
    },
    "Electronic Waste": {
        "recyclable": True,
        "recommended_bin": "E-Waste Bin",
        "environmental_score": 95,
        "material_type": "Silicon / PCB / Heavy Metals",
        "condition": "E-Waste / Specialized Recycling",
        "recommended_action": "Deliver batteries, circuit boards, or appliances to the municipal E-Waste collection counter."
    },
    "Hazardous Waste": {
        "recyclable": False,
        "recommended_bin": "Special Hazmat Dropoff",
        "environmental_score": 50,
        "material_type": "Toxic / Corrosive Chemical Compounds",
        "condition": "Toxic / Hazardous",
        "recommended_action": "Do not compost or recycle. Seal in a container and take to an authorized Hazardous Waste depot."
    }
}

# The current training pipeline exports a portable Keras v3 model.  Keeping the
# serving artifact in this format avoids the legacy H5 operator-serialization
# issue that prevented the validated checkpoint from loading consistently.
MODEL_PATH = os.path.join("model", "waste_classifier.keras")
EVAL_REPORT_PATH = os.path.join("model", "evaluation_report.json")
REAL_IMAGE_QA_REPORT_PATH = os.path.join("model", "real_image_test_report.json")
MAX_UPLOAD_BYTES = 5 * 1024 * 1024

model = None
grad_cam_model = None
last_conv_layer_name = "Conv_1"  # MobileNetV2's last conv block
model_accuracy = None
real_image_qa_pass_rate = None
model_quality_status = "MODEL_NOT_READY"


def build_grad_cam_model(classifier_model):
    """Build a model that outputs MobileNetV2's final conv features and predictions."""
    try:
        base_model = next(
            (
                layer for layer in classifier_model.layers
                if isinstance(layer, tf.keras.Model) and "mobilenetv2" in layer.name.lower()
            ),
            None,
        )
        if base_model is None:
            raise ValueError("MobileNetV2 backbone was not found in the classifier")

        last_conv = base_model.get_layer(last_conv_layer_name)
        backbone_with_features = tf.keras.Model(
            inputs=base_model.inputs,
            outputs=[last_conv.output, base_model.output],
        )

        backbone_index = classifier_model.layers.index(base_model)
        inputs = classifier_model.inputs[0]
        x = inputs
        for layer in classifier_model.layers[1:backbone_index]:
            x = layer(x)
        conv_outputs, x = backbone_with_features(x)
        for layer in classifier_model.layers[backbone_index + 1:]:
            x = layer(x, training=False)

        return tf.keras.Model(
            inputs=inputs,
            outputs=[conv_outputs, x],
        )
    except Exception as e:
        print(f"Grad-CAM model build failed: {e}")
        return None


def compute_grad_cam(img_array, class_idx):
    """
    Computes a Grad-CAM heatmap for the given image and predicted class index.
    Returns a base64-encoded PNG of the heatmap overlaid on the input image.
    """
    global grad_cam_model
    if grad_cam_model is None:
        return None

    try:
        with tf.GradientTape() as tape:
            img_tensor = tf.cast(img_array, tf.float32)
            tape.watch(img_tensor)
            conv_outputs, predictions = grad_cam_model(img_tensor)
            class_score = predictions[:, class_idx]

        # Gradients of the class score w.r.t. the conv output feature maps
        grads = tape.gradient(class_score, conv_outputs)
        # Pool gradients across spatial dimensions
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        # Weight the conv outputs by the pooled gradients
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        heatmap = heatmap.numpy()

        # Resize heatmap to 224x224
        heatmap_resized = np.array(
            Image.fromarray((heatmap * 255).astype(np.uint8)).resize((224, 224), Image.LANCZOS)
        )

        # Apply colormap (red=hot, blue=cold) manually for no-matplotlib dependency
        r = np.clip(heatmap_resized * 2.5, 0, 255).astype(np.uint8)
        g = np.clip(255 - heatmap_resized, 0, 255).astype(np.uint8)
        b = np.zeros_like(r)
        colormap = np.stack([r, g, b], axis=2)

        # The model owns MobileNetV2 preprocessing, so the request image is
        # deliberately kept in its original 0-255 RGB range here.
        orig_img = img_array[0].clip(0, 255).astype(np.uint8)

        # Blend overlay
        overlay = (orig_img * 0.55 + colormap * 0.45).clip(0, 255).astype(np.uint8)

        # Encode to base64 PNG
        buf = io.BytesIO()
        Image.fromarray(overlay).save(buf, format="PNG")
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")

    except Exception as e:
        print(f"Grad-CAM computation failed: {e}")
        return None


@app.on_event("startup")
def load_classification_model():
    global model, grad_cam_model, model_accuracy, real_image_qa_pass_rate, model_quality_status

    if os.path.exists(EVAL_REPORT_PATH):
        try:
            with open(EVAL_REPORT_PATH) as f:
                report = json.load(f)
            model_accuracy = report.get("accuracy")
            print(f"Evaluation report loaded. Model accuracy: {model_accuracy*100:.2f}%")
        except Exception as e:
            print(f"Could not load evaluation report: {e}")

    if os.path.exists(REAL_IMAGE_QA_REPORT_PATH):
        try:
            with open(REAL_IMAGE_QA_REPORT_PATH) as f:
                qa_report = json.load(f)
            passed = int(qa_report.get("passed", 0))
            total = passed + int(qa_report.get("failed", 0))
            real_image_qa_pass_rate = passed / total if total else None
            if real_image_qa_pass_rate is not None and real_image_qa_pass_rate < 0.85:
                model_quality_status = "HUMAN_REVIEW_REQUIRED"
                print("Held-out image QA is below the release threshold; all classifications require human verification.")
            else:
                model_quality_status = "VALIDATED"
        except Exception as e:
            model_quality_status = "HUMAN_REVIEW_REQUIRED"
            print(f"Could not load held-out image QA report: {e}")
    else:
        model_quality_status = "HUMAN_REVIEW_REQUIRED"
        print("Held-out image QA report is missing; classifications require human verification.")

    if os.path.exists(MODEL_PATH):
        try:
            print(f"Loading classification model from {MODEL_PATH}...")
            model = tf.keras.models.load_model(MODEL_PATH)
            print("Model loaded successfully!")
            # Build Grad-CAM model from the nested MobileNetV2 backbone.
            grad_cam_model = build_grad_cam_model(model)
            if grad_cam_model:
                print("Grad-CAM model ready.")
        except Exception as e:
            print(f"Error loading model: {e}")
            model_quality_status = "MODEL_NOT_READY"
    else:
        print(f"WARNING: Model file not found at {MODEL_PATH}.")


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "modelLoaded": model is not None,
        "model": "MobileNetV2",
        "validationAccuracy": model_accuracy,
        "independentQaAccuracy": real_image_qa_pass_rate,
        "gradCamEnabled": grad_cam_model is not None,
        "modelQualityStatus": model_quality_status,
    }


@app.post("/predict-waste")
async def predict_waste(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed.")

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="AI classification model is not loaded. The service is starting up or model training is required."
        )

    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="The uploaded image is empty.")
        if len(contents) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="Image size exceeds the 5MB limit.")
        image = Image.open(io.BytesIO(contents)).convert("RGB").resize((224, 224))
        # Preprocessing is embedded in waste_classifier.keras.  Applying it a
        # second time would distort every request before inference.
        img_array = np.array(image, dtype=np.float32)
        img_batch = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_batch, verbose=0)
        class_idx = int(np.argmax(predictions[0]))
        category = CLASSES[class_idx]
        confidence = float(predictions[0][class_idx] * 100)

        # Compute Grad-CAM heatmap
        grad_cam_b64 = compute_grad_cam(img_batch, class_idx)

        metadata = CLASS_METADATA.get(category, {
            "recyclable": True,
            "recommended_bin": "Blue Bin",
            "environmental_score": 80,
            "material_type": "Mixed Recyclable",
            "condition": "Untreated",
            "recommended_action": "Dispose in standard sorting bins."
        })

        response = {
            "category": category,
            "confidence": round(confidence, 1),
            "recyclable": metadata["recyclable"],
            "recommended_bin": metadata["recommended_bin"],
            "environmental_score": metadata["environmental_score"],
            "material_type": metadata["material_type"],
            "condition": metadata["condition"],
            "recommended_action": metadata["recommended_action"],
            "model_quality_status": model_quality_status,
            "requires_human_review": model_quality_status != "VALIDATED",
        }

        if grad_cam_b64:
            response["grad_cam_heatmap"] = grad_cam_b64

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
