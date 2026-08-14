import os
import json
import shutil
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.preprocessing.image import ImageDataGenerator

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
BATCH_SIZE = 16

def create_structured_synthetic_dataset(base_dir):
    """High-quality structured synthetic dataset with class-distinguishing visual profiles."""
    print("\n[Dataset] Generating high-quality structured synthetic dataset...")

    CLASS_PROFILES = {
        "Plastic":          {"base_rgb": [180, 220, 240], "noise": 20, "stripes": "vertical",   "shape_delta": [0, 0, 40]},
        "Paper":            {"base_rgb": [240, 235, 210], "noise": 15, "stripes": "horizontal", "shape_delta": [20, 10, -20]},
        "Glass":            {"base_rgb": [160, 210, 180], "noise": 10, "stripes": "diagonal",   "shape_delta": [-20, 30, 10]},
        "Metal":            {"base_rgb": [150, 155, 165], "noise": 25, "stripes": "horizontal", "shape_delta": [10, 10, 10]},
        "Organic Waste":    {"base_rgb": [75, 130, 55],  "noise": 35, "stripes": "none",        "shape_delta": [-20, 40, -30]},
        "Electronic Waste": {"base_rgb": [35, 55, 75],   "noise": 12, "stripes": "grid",        "shape_delta": [50, 50, 20]},
        "Hazardous Waste":  {"base_rgb": [215, 75, 55],  "noise": 20, "stripes": "none",        "shape_delta": [-30, 60, 30]},
    }

    from PIL import Image, ImageDraw

    COUNTS = {"train": 120, "validation": 30}

    for split, count in COUNTS.items():
        split_dir = os.path.join(base_dir, split)
        for class_name, profile in CLASS_PROFILES.items():
            class_dir = os.path.join(split_dir, class_name)
            os.makedirs(class_dir, exist_ok=True)
            existing = [f for f in os.listdir(class_dir) if f.endswith('.jpg')]
            if len(existing) >= count:
                print(f"  [skip] {split}/{class_name}: {len(existing)} images already exist")
                continue
            for idx in range(count):
                rng = np.random.RandomState(idx + abs(hash(class_name + split)) % 9999)
                base = np.array(profile["base_rgb"], dtype=np.float32)
                img_data = np.tile(base, (224, 224, 1)).astype(np.float32)
                noise = rng.randn(224, 224, 3) * profile["noise"]
                img_data = np.clip(img_data + noise, 0, 255).astype(np.uint8)

                stripes = profile["stripes"]
                if stripes == "vertical":
                    for col in range(0, 224, 20):
                        img_data[:, col:col+8, :] = np.clip(img_data[:, col:col+8, :].astype(int) + 30, 0, 255)
                elif stripes == "horizontal":
                    for row in range(0, 224, 18):
                        img_data[row:row+7, :, :] = np.clip(img_data[row:row+7, :, :].astype(int) + 30, 0, 255)
                elif stripes == "diagonal":
                    for d in range(-224, 224, 16):
                        for r in range(224):
                            c = r + d
                            if 0 <= c < 224:
                                img_data[r, c, :] = np.clip(int(img_data[r, c, 0]) + 40, 0, 255)
                elif stripes == "grid":
                    for x in range(0, 224, 24):
                        img_data[:, x:x+2, :] = 180
                    for y in range(0, 224, 24):
                        img_data[y:y+2, :, :] = 180

                pil_img = Image.fromarray(img_data)
                draw = ImageDraw.Draw(pil_img)
                cx = 112 + rng.randint(-20, 20)
                cy = 112 + rng.randint(-20, 20)
                w = rng.randint(40, 90)
                h = rng.randint(50, 100)
                delta = profile["shape_delta"]
                r = int(np.clip(profile["base_rgb"][0] + delta[0] + rng.randint(-20, 20), 10, 245))
                g = int(np.clip(profile["base_rgb"][1] + delta[1] + rng.randint(-20, 20), 10, 245))
                b = int(np.clip(profile["base_rgb"][2] + delta[2] + rng.randint(-20, 20), 10, 245))
                draw.ellipse([cx - w, cy - h, cx + w, cy + h], fill=(r, g, b))
                img_array = np.array(pil_img).astype(np.uint8)
                Image.fromarray(img_array).save(
                    os.path.join(class_dir, f"{class_name.replace(' ', '_')}_{split}_{idx:03d}.jpg"), quality=90
                )
            print(f"  [done] {split}/{class_name}: {count} images created")
    print("[Dataset] Generation complete.\n")


def count_split(split_dir):
    total = 0
    for cls in sorted(os.listdir(split_dir)):
        cls_path = os.path.join(split_dir, cls)
        if os.path.isdir(cls_path):
            n = len([f for f in os.listdir(cls_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
            print(f"    {cls}: {n}")
            total += n
    return total


def build_model(num_classes):
    base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights="imagenet")
    base_model.trainable = False
    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation="relu", kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    return tf.keras.Model(inputs, outputs), base_model


def main():
    dataset_dir = "dataset"
    train_dir = os.path.join(dataset_dir, "train")
    val_dir   = os.path.join(dataset_dir, "validation")

    real_data = False
    if os.path.exists(train_dir):
        total_train_check = sum(
            len([f for f in os.listdir(os.path.join(train_dir, c))
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
            for c in os.listdir(train_dir)
            if os.path.isdir(os.path.join(train_dir, c))
        )
        if total_train_check >= 700:
            real_data = True
            print(f"[Dataset] Real dataset detected ({total_train_check} training images).")
        else:
            print(f"[Dataset] Only {total_train_check} images. Regenerating structured synthetic dataset.")
            shutil.rmtree(dataset_dir, ignore_errors=True)

    if not real_data:
        create_structured_synthetic_dataset(dataset_dir)

    print("[Dataset] Training split:")
    total_train = count_split(train_dir)
    print(f"  Total: {total_train} training images")
    print("[Dataset] Validation split:")
    total_val = count_split(val_dir)
    print(f"  Total: {total_val} validation images\n")

    train_datagen = ImageDataGenerator(
        rotation_range=25,
        width_shift_range=0.15,
        height_shift_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
        brightness_range=[0.75, 1.25],
        fill_mode="nearest"
    )
    val_datagen = ImageDataGenerator()

    train_gen = train_datagen.flow_from_directory(
        train_dir, target_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_mode="categorical", classes=CLASSES, shuffle=True
    )
    val_gen = val_datagen.flow_from_directory(
        val_dir, target_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_mode="categorical", classes=CLASSES, shuffle=False
    )

    os.makedirs("model", exist_ok=True)
    model, base_model = build_model(len(CLASSES))

    best_ckpt = "model/waste_classifier_best.keras"
    checkpoint_cb = ModelCheckpoint(best_ckpt, monitor="val_accuracy", save_best_only=True, verbose=1)
    early_stop_cb = EarlyStopping(monitor="val_accuracy", patience=6, restore_best_weights=True, verbose=1)
    reduce_lr_cb  = ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, min_lr=1e-7, verbose=1)

    print("\n=== Phase 1: Classification head training (MobileNetV2 frozen) ===")
    model.compile(optimizer=optimizers.Adam(1e-3), loss="categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_gen, validation_data=val_gen, epochs=12,
              callbacks=[checkpoint_cb, early_stop_cb, reduce_lr_cb])

    print("\n=== Phase 2: Fine-tuning top 30 MobileNetV2 layers ===")
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    model.compile(optimizer=optimizers.Adam(1e-5), loss="categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_gen, validation_data=val_gen, epochs=25,
              callbacks=[checkpoint_cb, early_stop_cb, reduce_lr_cb])

    print("\n=== Loading best checkpoint for final evaluation ===")
    model = tf.keras.models.load_model(best_ckpt)

    val_gen.reset()
    y_true_oh, y_pred_probs = [], []
    for i, (imgs, labels) in enumerate(val_gen):
        y_pred_probs.extend(model.predict(imgs, verbose=0))
        y_true_oh.extend(labels)
        if i + 1 >= len(val_gen):
            break

    y_true = np.argmax(y_true_oh, axis=1)
    y_pred = np.argmax(y_pred_probs, axis=1)
    num_classes = len(CLASSES)
    accuracy = float(np.mean(y_true == y_pred))

    cm = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(y_true, y_pred):
        cm[t, p] += 1

    precisions, recalls, f1s = [], [], []
    for i in range(num_classes):
        tp = cm[i, i]; fp = int(np.sum(cm[:, i])) - tp; fn = int(np.sum(cm[i, :])) - tp
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec  = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1   = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0.0
        precisions.append(prec); recalls.append(rec); f1s.append(f1)

    avg_p = float(np.mean(precisions)); avg_r = float(np.mean(recalls)); avg_f1 = float(np.mean(f1s))

    print("\n" + "=" * 52)
    print("   GREENPULSE AI MODEL — EVALUATION REPORT")
    print("=" * 52)
    print(f"  Training images:   {total_train}")
    print(f"  Validation images: {total_val}")
    print(f"  Classes:           {num_classes}")
    print(f"  Accuracy:          {accuracy*100:.2f}%")
    print(f"  Precision:         {avg_p*100:.2f}%")
    print(f"  Recall:            {avg_r*100:.2f}%")
    print(f"  F1 Score:          {avg_f1*100:.2f}%")
    print("\n  Per-class:")
    for i, cls in enumerate(CLASSES):
        print(f"    {cls:<20} P={precisions[i]*100:.1f}%  R={recalls[i]*100:.1f}%  F1={f1s[i]*100:.1f}%")
    print("\n  Confusion Matrix:")
    header = "  " + " " * 18 + "  ".join([c[:4] for c in CLASSES])
    print(header)
    for idx, row in enumerate(cm):
        print(f"  {CLASSES[idx][:16]:<16}  {list(row)}")
    print("=" * 52)

    model.save("model/waste_classifier.keras")
    print("Model saved: model/waste_classifier.keras")

    with open("model/labels.json", "w") as f:
        json.dump({str(i): cls for i, cls in enumerate(CLASSES)}, f, indent=2)
    print("Labels saved: model/labels.json")

    eval_report = {
        "dataset_train_images": total_train,
        "dataset_val_images": total_val,
        "num_classes": num_classes,
        "classes": CLASSES,
        "accuracy": round(accuracy, 4),
        "precision": round(avg_p, 4),
        "recall": round(avg_r, 4),
        "f1_score": round(avg_f1, 4),
        "per_class": [
            {"class": CLASSES[i], "precision": round(precisions[i], 4),
             "recall": round(recalls[i], 4), "f1": round(f1s[i], 4)}
            for i in range(num_classes)
        ],
        "confusion_matrix": cm.tolist()
    }
    with open("model/evaluation_report.json", "w") as f:
        json.dump(eval_report, f, indent=2)
    print("Evaluation report saved: model/evaluation_report.json")


if __name__ == "__main__":
    main()
