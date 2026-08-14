"""Convert the validated legacy H5 checkpoint to the supported Keras format.

Run once from ai-service/:
    venv/bin/python migrate_legacy_checkpoint.py
"""
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers


LEGACY_PATH = "model/waste_classifier_best.h5"
OUTPUT_PATH = "model/waste_classifier.keras"


class TrueDivide(layers.Layer):
    """Compatibility layer for a legacy serialized MobileNetV2 division op."""

    def __call__(self, inputs, denominator=None, **kwargs):
        return super().__call__(inputs, denominator=denominator, **kwargs)

    def call(self, inputs, denominator=None):
        return inputs / denominator


class Subtract(layers.Layer):
    """Compatibility layer for a legacy serialized MobileNetV2 subtraction op."""

    def __call__(self, inputs, value=None, **kwargs):
        return super().__call__(inputs, value=value, **kwargs)

    def call(self, inputs, value=None):
        return inputs - value


def main():
    legacy = tf.keras.models.load_model(
        LEGACY_PATH,
        custom_objects={"TrueDivide": TrueDivide, "Subtract": Subtract},
        compile=False,
    )
    backbone = next(
        layer for layer in legacy.layers
        if isinstance(layer, tf.keras.Model) and "mobilenetv2" in layer.name.lower()
    )
    backbone_index = legacy.layers.index(backbone)

    inputs = tf.keras.Input(shape=legacy.input_shape[1:], name="image")
    x = layers.Rescaling(1 / 127.5, offset=-1, name="mobilenetv2_preprocess")(inputs)
    x = backbone(x, training=False)
    for layer in legacy.layers[backbone_index + 1:]:
        x = layer(x, training=False)
    converted = tf.keras.Model(inputs, x, name="greenpulse_waste_classifier")

    # Fail closed if the conversion changes the validated checkpoint's output.
    probe = np.random.default_rng(42).uniform(0, 255, size=(2, 224, 224, 3)).astype(np.float32)
    largest_delta = float(np.max(np.abs(legacy.predict(probe, verbose=0) - converted.predict(probe, verbose=0))))
    if largest_delta > 1e-5:
        raise RuntimeError(f"Converted model predictions diverged (max delta: {largest_delta})")

    converted.save(OUTPUT_PATH)
    print(f"Saved portable model: {OUTPUT_PATH}")
    print(f"Maximum prediction delta: {largest_delta:.8f}")


if __name__ == "__main__":
    main()
