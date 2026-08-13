import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from PIL import Image

# 1. Define configuration
CLASSES = [
    "Plastic",
    "Paper",
    "Glass",
    "Metal",
    "Organic Waste",
    "Electronic Waste",
    "Hazardous Waste"
]
IMG_SIZE = (224, 224)
BATCH_SIZE = 4
EPOCHS = 2

def create_simulated_dataset(base_dir):
    """Creates a real folder-based image dataset with simulated patterns for training."""
    print("Generating simulated image datasets for training...")
    for split in ["train", "validation"]:
        split_dir = os.path.join(base_dir, split)
        for class_name in CLASSES:
            class_dir = os.path.join(split_dir, class_name)
            os.makedirs(class_dir, exist_ok=True)
            
            # Generate 8 images per class for training, 4 for validation
            num_images = 8 if split == "train" else 4
            for idx in range(num_images):
                # Create a random RGB pattern representing the object
                img_data = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
                
                # Draw simple shapes to simulate structure
                if class_name == "Plastic":
                    img_data[40:180, 80:140, 2] = 200 # Blue patterns
                elif class_name == "Organic Waste":
                    img_data[60:160, 60:160, 1] = 180 # Green patterns
                elif class_name == "Metal":
                    img_data[50:170, 70:150, :] = 150 # Grey patterns
                
                img = Image.fromarray(img_data)
                img.save(os.path.join(class_dir, f"sim_{idx}.jpg"))

def build_transfer_learning_model():
    """Builds a waste classifier using MobileNetV2 transfer learning."""
    print("Loading pre-trained MobileNetV2 backbone...")
    
    # Load MobileNetV2 with ImageNet weights, excluding the classifier head
    base_model = MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet"
    )
    
    # Freeze the pre-trained base
    base_model.trainable = False
    
    # Build classification head
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.2),
        layers.Dense(128, activation="relu"),
        layers.Dense(len(CLASSES), activation="softmax")
    ])
    
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    return model

def main():
    dataset_dir = "dataset"
    create_simulated_dataset(dataset_dir)
    
    # 2. Build the dataset loaders with real preprocessing & data augmentation
    print("Loading datasets using tf.keras.utils.image_dataset_from_directory...")
    
    # Simple data augmentation layers
    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.2),
        layers.RandomZoom(0.1),
    ])

    train_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(dataset_dir, "train"),
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(dataset_dir, "validation"),
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )
    
    # Preprocess inputs for MobileNetV2 (scales pixels between -1 and 1)
    preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input
    
    train_ds = train_ds.map(lambda x, y: (data_augmentation(preprocess_input(x)), y))
    val_ds = val_ds.map(lambda x, y: (preprocess_input(x), y))
    
    # 3. Train the model
    model = build_transfer_learning_model()
    model.summary()
    
    print(f"Starting model training for {EPOCHS} epochs...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS
    )
    
    # 4. Save and export the trained model
    os.makedirs("model", exist_ok=True)
    model_path = os.path.join("model", "waste_classifier.h5")
    model.save(model_path)
    print(f"Model successfully saved and exported to: {model_path}")

if __name__ == "__main__":
    main()
