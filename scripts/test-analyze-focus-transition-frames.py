"""Executable fixtures for the optional frame classifier."""

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from PIL import Image, ImageDraw


SCRIPT = Path(__file__).with_name("analyze-focus-transition-frames.py")


class FocusFrameAnalysisTests(unittest.TestCase):
    def test_reports_only_pale_text_free_run(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            directory = Path(temp)
            for index in range(5):
                image = Image.new("RGB", (80, 50), "#eeeeee")
                if index in (0, 4):
                    ImageDraw.Draw(image).rectangle((8, 4, 55, 14), fill="#222222")
                elif index == 3:
                    ImageDraw.Draw(image).rectangle((0, 0, 79, 49), fill="#111111")
                image.save(directory / f"frame-{index:03d}.png")
            result = subprocess.run(
                [sys.executable, str(SCRIPT), str(directory), "--region", "0", "0", "80", "50"],
                check=True, capture_output=True, text=True,
            )
            report = json.loads(result.stdout)
            self.assertEqual(report["candidateBlankRuns"], [[1, 2]])
            self.assertEqual(report["frames"], 5)

    def test_rejects_missing_frames(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            result = subprocess.run(
                [sys.executable, str(SCRIPT), temp], capture_output=True, text=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("no frame-*.png files found", result.stderr)


if __name__ == "__main__":
    unittest.main()
