"""Post-training QA for held-out demo images.

The model file embeds MobileNetV2 preprocessing, so images must be passed in
their original 0-255 RGB form.  This set is useful as a smoke test, but it is
not a substitute for a genuinely photographed, independently sourced test set.
"""
import os, json
import numpy as np
import tensorflow as tf
from PIL import Image

MODEL_PATH = "model/waste_classifier.keras"
TEST_DIR   = "real_tests"
CLASSES    = ["Plastic", "Paper", "Glass", "Metal", "Organic Waste", "Electronic Waste", "Hazardous Waste"]

EXPECTED = {
    "plastic_bottle": "Plastic",
    "soda_can":       "Metal",
    "banana_peel":    "Organic Waste",
    "circuit_board":  "Electronic Waste",
    "paper_sheet":    "Paper",
    "glass_bottle":   "Glass",
    "battery":        "Hazardous Waste",
}

def load_and_preprocess(path):
    img = Image.open(path).convert("RGB").resize((224, 224))
    arr = np.array(img, dtype=np.float32)
    return np.expand_dims(arr, axis=0)

def main():
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model not found at {MODEL_PATH}. Run train.py first.")
        return

    print("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"Model loaded. Input shape: {model.input_shape}\n")

    print("=" * 60)
    print("  GREENPULSE AI — HELD-OUT DEMO IMAGE QA")
    print("=" * 60)

    passed = 0
    failed = 0
    results = []

    for fname in sorted(os.listdir(TEST_DIR)):
        if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        stem = os.path.splitext(fname)[0]
        expected = EXPECTED.get(stem, "Unknown")
        fpath = os.path.join(TEST_DIR, fname)

        img_batch = load_and_preprocess(fpath)
        preds = model.predict(img_batch, verbose=0)
        class_idx = int(np.argmax(preds[0]))
        predicted = CLASSES[class_idx]
        confidence = float(preds[0][class_idx] * 100)

        ok = "✅ PASS" if predicted == expected else "❌ FAIL"
        if predicted == expected:
            passed += 1
        else:
            failed += 1

        print(f"  {ok} | {fname:<25} Expected: {expected:<18} Got: {predicted:<18} Conf: {confidence:.1f}%")
        results.append({
            "file": fname,
            "expected": expected,
            "predicted": predicted,
            "confidence": round(confidence, 1),
            "pass": predicted == expected
        })

    print("=" * 60)
    total = passed + failed
    print(f"  Result: {passed}/{total} passed ({passed/total*100:.0f}%)")
    print(f"  High-confidence (>85%) passes: {sum(1 for r in results if r['pass'] and r['confidence'] >= 85)}/{total}")
    print("=" * 60)

    # Check evaluation report for validation accuracy
    eval_path = "model/evaluation_report.json"
    if os.path.exists(eval_path):
        with open(eval_path) as f:
            report = json.load(f)
        print(f"\n  Model Validation Accuracy: {report['accuracy']*100:.2f}%")
        print(f"  Precision: {report['precision']*100:.2f}%")
        print(f"  Recall:    {report['recall']*100:.2f}%")
        print(f"  F1 Score:  {report['f1_score']*100:.2f}%")

    report = {
        "test_set_note": "Generated held-out demo images; not an independently sourced photographic test set.",
        "passed": passed,
        "failed": failed,
        "tests": results,
    }
    eval_path = "model/evaluation_report.json"
    if os.path.exists(eval_path):
        with open(eval_path) as f:
            report["validation_metrics"] = json.load(f)

    with open("model/real_image_test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    print("\n  Demo image QA report saved: model/real_image_test_report.json")

if __name__ == "__main__":
    main()
