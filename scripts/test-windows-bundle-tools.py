import hashlib
import importlib.util
import io
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch, MagicMock
import urllib.error
import urllib.request
import zipfile

spec = importlib.util.spec_from_file_location("bundle_tools", Path(__file__).with_name("prepare-windows-bundle-tools.py"))
tools = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tools)

class BundleToolsTests(unittest.TestCase):
    def test_pinned_bytes(self):
        data = b"fixture"
        item = dict(name="fixture", bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
        self.assertEqual(tools.verify(data, item), data)
        with self.assertRaises(ValueError):
            tools.verify(b"changed", item)

    def archive(self, names):
        output = io.BytesIO()
        with zipfile.ZipFile(output, "w") as archive:
            for name in names:
                archive.writestr(name, b"fixture")
        return output.getvalue()

    def test_safe_extraction_and_complete_rejection_before_writes(self):
        with tempfile.TemporaryDirectory(prefix="narro-tool-zip-test-") as tmp:
            root = Path(tmp) / "cache"
            tools.extract(self.archive(["prefix/tool.exe"]), root, "prefix/")
            self.assertEqual((root / "tool.exe").read_bytes(), b"fixture")
            for names, prefix in [(["ok", "../escaped"], ""), (["wrong/tool"], "prefix/")]:
                target = Path(tmp) / "rejected"
                with self.assertRaises(ValueError):
                    tools.extract(self.archive(names), target, prefix)
                self.assertFalse(target.exists())
            info = zipfile.ZipInfo("link")
            info.external_attr = (stat.S_IFLNK | 0o777) << 16
            with self.assertRaises(ValueError):
                tools.extract(self.archive([info]), root)

    def test_transient_retry_and_nontransient_immediate_failure(self):
        data = b"fixture"
        item = dict(name="fixture", repo="owner/repo", asset=1, bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
        response = MagicMock()
        response.__enter__.return_value.read.return_value = data
        opener = MagicMock()
        opener.open.side_effect = [urllib.error.HTTPError("https://api.github.com", 504, "gateway", {}, None), response]
        with patch.object(tools.urllib.request, "build_opener", return_value=opener), patch.object(tools.time, "sleep"):
            records = []
            self.assertEqual(tools.download(item, records), data)
            self.assertEqual([x["result"] for x in records], ["FAILED", "VERIFIED"])
        for failure in [urllib.error.HTTPError("https://api.github.com", 403, "denied", {}, None),
                        urllib.error.HTTPError("https://api.github.com", 404, "missing", {}, None)]:
            opener.open.side_effect = failure
            opener.open.reset_mock()
            with patch.object(tools.urllib.request, "build_opener", return_value=opener), self.assertRaises(urllib.error.HTTPError):
                tools.download(item, [])
            self.assertEqual(opener.open.call_count, 1)
        opener.open.side_effect = None
        response.__enter__.return_value.read.return_value = b"bad hash"
        opener.open.return_value = response
        opener.open.reset_mock()
        with patch.object(tools.urllib.request, "build_opener", return_value=opener), self.assertRaises(ValueError):
            tools.download(item, [])
        self.assertEqual(opener.open.call_count, 1)

    def test_redirect_drops_token_and_rejects_untrusted_or_plaintext(self):
        request = urllib.request.Request("https://api.github.com/repos/owner/repo/releases/assets/1", headers={"Authorization": "Bearer fixture"})
        handler = tools.AssetRedirect()
        redirected = handler.redirect_request(request, None, 302, "found", {}, "https://release-assets.githubusercontent.com/fixture")
        self.assertIsNone(redirected.get_header("Authorization"))
        for url in ["http://release-assets.githubusercontent.com/fixture", "https://unexpected.invalid/fixture"]:
            with self.assertRaises(urllib.error.URLError):
                handler.redirect_request(request, None, 302, "found", {}, url)

if __name__ == "__main__":
    unittest.main()
