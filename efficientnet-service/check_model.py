
import torch

from pathlib import Path

MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "efficientnet_b0_ffpp_c23.pth"
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=True
)

print("Checkpoint type:", type(checkpoint))
print("Number of parameters:", len(checkpoint))

print("\nFirst 15 checkpoint keys:")
for key in list(checkpoint.keys())[:15]:
    print(key)

print("\nClassifier weights:")
print(checkpoint["classifier.1.weight"].shape)

print("\nClassifier bias:")
print(checkpoint["classifier.1.bias"])
