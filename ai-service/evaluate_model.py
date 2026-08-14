"""Evaluate the exported GreenPulse model against the validation split.

Run from ai-service/ after training or checkpoint migration:
    venv/bin/python evaluate_model.py
"""
import json
import os

import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator


MODEL_PATH = "model/waste_classifier.keras"
REPORT_PATH = "model/evaluation_report.json"
CLASSES = [
    "Plastic",
    "Paper",
    "Glass",
    "Metal",
    "Organic Waste",
    "Electronic Waste",
    "Hazardous Waste",
]


def main():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    validation = ImageDataGenerator().flow_from_directory(
        "dataset/validation",
        target_size=(224, 224),
        batch_size=16,
        class_mode="categorical",
        classes=CLASSES,
        shuffle=False,
    )
    probabilities = model.predict(validation, verbose=0)
    actual = validation.classes
    predicted = np.argmax(probabilities, axis=1)

    confusion_matrix = np.zeros((len(CLASSES), len(CLASSES)), dtype=int)
    for actual_class, predicted_class in zip(actual, predicted):
        confusion_matrix[actual_class, predicted_class] += 1

    per_class = []
    for index, category in enumerate(CLASSES):
        true_positive = int(confusion_matrix[index, index])
        false_positive = int(confusion_matrix[:, index].sum()) - true_positive
        false_negative = int(confusion_matrix[index, :].sum()) - true_positive
        precision = true_positive / (true_positive + false_positive) if true_positive + false_positive else 0.0
        recall = true_positive / (true_positive + false_negative) if true_positive + false_negative else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        per_class.append({
            "class": category,
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
            "support": int(confusion_matrix[index, :].sum()),
        })

    report = {
        "dataset_train_images": sum(
            len(files) for _, _, files in os.walk("dataset/train")
        ),
        "dataset_val_images": int(len(actual)),
        "num_classes": len(CLASSES),
        "classes": CLASSES,
        "accuracy": round(float(np.mean(actual == predicted)), 4),
        "precision": round(float(np.mean([item["precision"] for item in per_class])), 4),
        "recall": round(float(np.mean([item["recall"] for item in per_class])), 4),
        "f1_score": round(float(np.mean([item["f1"] for item in per_class])), 4),
        "per_class": per_class,
        "confusion_matrix": confusion_matrix.tolist(),
    }
    with open(REPORT_PATH, "w") as report_file:
        json.dump(report, report_file, indent=2)

    print("GREENPULSE AI — VALIDATION REPORT")
    print(f"Accuracy:  {report['accuracy'] * 100:.2f}%")
    print(f"Precision: {report['precision'] * 100:.2f}% (macro)")
    print(f"Recall:    {report['recall'] * 100:.2f}% (macro)")
    print(f"F1 score:  {report['f1_score'] * 100:.2f}% (macro)")
    for item in per_class:
        print(
            f"  {item['class']:<18} P={item['precision'] * 100:5.1f}% "
            f"R={item['recall'] * 100:5.1f}% F1={item['f1'] * 100:5.1f}% n={item['support']}"
        )
    print(f"Saved: {REPORT_PATH}")


if __name__ == "__main__":
    main()
