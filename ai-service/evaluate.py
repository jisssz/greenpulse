import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import image_dataset_from_directory

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

def main():
    model_path = os.path.join("model", "waste_classifier.keras")
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}. Please run train.py first.")
        return

    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)

    dataset_dir = "dataset"
    val_dir = os.path.join(dataset_dir, "validation")
    if not os.path.exists(val_dir):
        print(f"Error: Validation directory not found at {val_dir}.")
        return

    print("Loading validation dataset...")
    val_ds = image_dataset_from_directory(
        val_dir,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False
    )

    # Preprocess val dataset
    preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input
    val_ds_preprocessed = val_ds.map(lambda x, y: (preprocess_input(x), y))

    y_true = []
    y_pred = []

    print("Running batch predictions...")
    for images, labels in val_ds_preprocessed:
        preds = model.predict(images)
        y_true.extend(labels.numpy())
        y_pred.extend(np.argmax(preds, axis=1))

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # 1. Accuracy
    accuracy = np.mean(y_true == y_pred)

    # 2. Confusion Matrix
    num_classes = len(CLASSES)
    cm = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(y_true, y_pred):
        cm[t, p] += 1

    # 3. Precision and Recall per class
    precisions = []
    recalls = []
    for i in range(num_classes):
        tp = cm[i, i]
        fp = np.sum(cm[:, i]) - tp
        fn = np.sum(cm[i, :]) - tp

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        
        precisions.append(precision)
        recalls.append(recall)

    avg_precision = np.mean(precisions)
    avg_recall = np.mean(recalls)

    print("\n" + "="*40)
    print(" AI MODEL EVALUATION REPORT")
    print("="*40)
    print(f"Overall Accuracy:  {accuracy * 100:.2f}%")
    print(f"Average Precision: {avg_precision * 100:.2f}%")
    print(f"Average Recall:    {avg_recall * 100:.2f}%")
    print("\nConfusion Matrix:")
    print(" " * 18 + " ".join([c[:3] for c in CLASSES]))
    for idx, row in enumerate(cm):
        print(f"{CLASSES[idx][:15]:<15} {row}")
    print("="*40)

if __name__ == "__main__":
    main()
