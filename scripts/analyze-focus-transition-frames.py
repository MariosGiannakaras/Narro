"""Flag pale, text-free Focus frames in a visible-desktop PNG capture.

This is a diagnostic aid, not a compositor PASS oracle. Supply an unobstructed
fixed desktop crop that contains the Focus surface in every frame. Pillow is
required only when running this optional script locally.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


def classify(frame: Path, region: tuple[int, int, int, int]) -> dict[str, object]:
    with Image.open(frame) as image:
        if image.width < region[2] or image.height < region[3]:
            raise ValueError(f"{frame}: region exceeds {image.width}x{image.height}")
        sample = image.convert("RGB").crop(region)
        pixels = list(sample.get_flattened_data())

    total = len(pixels)
    pale = sum(min(pixel) >= 215 for pixel in pixels) / total
    dark = sum(max(pixel) <= 160 for pixel in pixels) / total
    return {
        "frame": frame.name,
        "paleFraction": round(pale, 4),
        "darkFraction": round(dark, 4),
        "candidateBlank": pale >= 0.92 and dark <= 0.005,
    }


def runs(indexes: list[int]) -> list[list[int]]:
    grouped: list[list[int]] = []
    for index in indexes:
        if not grouped or index != grouped[-1][-1] + 1:
            grouped.append([index])
        else:
            grouped[-1].append(index)
    return [[group[0], group[-1]] for group in grouped]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("frames_dir", type=Path)
    parser.add_argument(
        "--region", type=int, nargs=4, metavar=("LEFT", "TOP", "RIGHT", "BOTTOM"),
        default=(8, 0, 348, 110),
        help="fixed crop within each captured frame; default samples Timer-sized top area",
    )
    args = parser.parse_args()
    region = tuple(args.region)
    if region[0] < 0 or region[1] < 0 or region[2] <= region[0] or region[3] <= region[1]:
        parser.error("region must have positive width and height")
    frames = sorted(args.frames_dir.glob("frame-*.png"))
    if not frames:
        parser.error("no frame-*.png files found")
    results = [classify(frame, region) for frame in frames]
    blank = [index for index, result in enumerate(results) if result["candidateBlank"]]
    print(json.dumps({
        "region": region,
        "frames": len(results),
        "candidateBlankRuns": runs(blank),
        "candidates": [results[index] for index in blank],
    }, indent=2))


if __name__ == "__main__":
    main()
