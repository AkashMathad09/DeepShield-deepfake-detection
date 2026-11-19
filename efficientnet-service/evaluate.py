
import time
import csv
from pathlib import Path

import torch
from torch import nn
from torchvision import models, transforms
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

MODEL_PATH = BASE_DIR / "models" / "efficientnet_b0_ffpp_c23.pth"
DATASET_DIR = PROJECT_DIR / "evaluation_dataset"
REPORT_PATH = BASE_DIR / "misclassified_images.csv"

device = torch.device("cpu")

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=True
)

model = models.efficientnet_b0(weights=None)
model.classifier[1] = nn.Linear(1280, 2)
model.load_state_dict(checkpoint, strict=True)
model.to(device)
model.eval()

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

confusion = [[0, 0], [0, 0]]
correct = 0
total = 0
errors = 0
misclassified = []

start_time = time.perf_counter()

for folder, actual_label in [("real", 0), ("fake", 1)]:
    folder_path = DATASET_DIR / folder

    image_files = [
        p for p in folder_path.iterdir()
        if p.is_file() and p.suffix.lower() in
        [".jpg", ".jpeg", ".png", ".bmp", ".webp"]
    ]

    for image_path in image_files:
        try:
            image = Image.open(image_path).convert("RGB")
            tensor = preprocess(image).unsqueeze(0).to(device)

            with torch.inference_mode():
                logits = model(tensor)
                probabilities = torch.softmax(logits, dim=1)[0]
                predicted_label = logits.argmax(dim=1).item()

            confusion[actual_label][predicted_label] += 1
            total += 1

            if predicted_label == actual_label:
                correct += 1
            else:
                misclassified.append({
                    "filename": image_path.name,
                    "actual": "REAL" if actual_label == 0 else "FAKE",
                    "predicted": "REAL" if predicted_label == 0 else "FAKE",
                    "real_probability": round(probabilities[0].item() * 100, 2),
                    "fake_probability": round(probabilities[1].item() * 100, 2),
                    "image_path": str(image_path)
                })

        except Exception as error:
            errors += 1
            print(f"Skipped {image_path.name}: {error}")

elapsed = time.perf_counter() - start_time

tn = confusion[0][0]
fp = confusion[0][1]
fn = confusion[1][0]
tp = confusion[1][1]

accuracy = correct / total if total else 0
precision = tp / (tp + fp) if (tp + fp) else 0
recall = tp / (tp + fn) if (tp + fn) else 0
f1 = (
    2 * precision * recall / (precision + recall)
    if (precision + recall) else 0
)

if misclassified:
    with open(REPORT_PATH, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=misclassified[0].keys())
        writer.writeheader()
        writer.writerows(misclassified)

print("\n========== DEEPSHIELD EVALUATION ==========")
print(f"Total images tested : {total}")
print(f"Correct predictions : {correct}")
print(f"Incorrect predictions: {total - correct}")
print(f"Skipped images      : {errors}")

print("\nConfusion Matrix")
print("                 Predicted REAL  Predicted FAKE")
print(f"Actual REAL          {tn:5}          {fp:5}")
print(f"Actual FAKE          {fn:5}          {tp:5}")

print("\nPerformance Metrics")
print(f"Accuracy  : {accuracy * 100:.2f}%")
print(f"Precision : {precision * 100:.2f}%")
print(f"Recall    : {recall * 100:.2f}%")
print(f"F1-score  : {f1 * 100:.2f}%")

print(f"\nTotal inference time: {elapsed:.2f} seconds")
print(f"Average per image  : {elapsed / total * 1000:.2f} ms" if total else "No images tested")

print(f"\nMisclassified images saved to: {REPORT_PATH}")
print("===========================================")
