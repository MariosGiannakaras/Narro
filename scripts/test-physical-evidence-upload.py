import importlib.util,pathlib,tempfile,json,unittest,hashlib,time,os,zipfile,io
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('uploader',pathlib.Path(__file__).with_name('upload-physical-evidence.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class TransferTests(unittest.TestCase):
 def test_frozen_transfer_and_retry(self):
  with tempfile.TemporaryDirectory() as t:
   root=pathlib.Path(t)/'session';root.mkdir();(root/'session.json').write_text(json.dumps({'state':'FROZEN','recording':{'closed':True}}));(root/'desktop.mkv').write_bytes(b'original-video');assets=[];payloads=[]
   (root/'nested').mkdir();(root/'nested/UPLOAD_STATUS.json').write_bytes(b'evidence, not root delivery state')
   fail_after_upload=[False]
   def fake(*a,binary=False):
    if a[:2]==('release','view'):return json.dumps({'id':'graphql-id','isDraft':True,'url':'https://example.invalid/draft'})
    if a[:2]==('release','upload'):
     p=pathlib.Path(a[3]);payloads.append(p.read_bytes());assets.append({'id':7+len(assets),'name':p.name,'size':p.stat().st_size,'digest':'sha256:'+m.digest(p)})
     if fail_after_upload[0]:raise RuntimeError('connection lost after remote upload')
     return ''
    if a[0]=='api' and '/assets?' in a[1]:return json.dumps(assets)
    if a[0]=='api':return json.dumps([{'id':1,'tag_name':'test'}])
    raise AssertionError(a)
   m.gh=fake
   (root/'UPLOAD_STATUS.json').write_text('{"status":"UPLOAD_PENDING","utc":"first"}')
   a=m.upload(root,'owner/repo','test');time.sleep(2.1)
   (root/'UPLOAD_STATUS.json').write_text('{"status":"UPLOADED_VERIFIED","utc":"second"}')
   for p in root.rglob('*'):
    if p.is_file():os.utime(p,(1700000000,1700000000))
   b=m.upload(root,'owner/repo','test')
   self.assertEqual(a['status'],'UPLOADED_VERIFIED');self.assertEqual(a['sha256'],b['sha256']);self.assertEqual(len(assets),1)
   self.assertEqual((root/'desktop.mkv').read_bytes(),b'original-video')
   with zipfile.ZipFile(io.BytesIO(payloads[0])) as z:
    self.assertEqual(z.read('session/desktop.mkv'),b'original-video')
    self.assertIn('session/nested/UPLOAD_STATUS.json',z.namelist())
    self.assertNotIn('session/UPLOAD_STATUS.json',z.namelist())
    extracted=pathlib.Path(t)/'extracted';z.extractall(extracted)
   c=m.upload(extracted/'session','owner/repo','test')
   self.assertEqual(a['sha256'],c['sha256']);self.assertEqual(len(assets),1)
   (root/'desktop.mkv').write_bytes(b'changed-video')
   fail_after_upload[0]=True
   with self.assertRaisesRegex(RuntimeError,'connection lost'):m.upload(root,'owner/repo','test')
   fail_after_upload[0]=False
   d=m.upload(root,'owner/repo','test')
   self.assertNotEqual(a['sha256'],d['sha256']);self.assertEqual(len(assets),2)
 def test_upload_failure_cleans_private_staging_and_retains_original(self):
  with tempfile.TemporaryDirectory() as t:
   root=pathlib.Path(t)/'session';root.mkdir()
   (root/'session.json').write_text(json.dumps({'state':'FROZEN','recording':{'closed':True}}))
   (root/'desktop.mkv').write_bytes(b'original-private-video')
   staged=[]
   original_temp=m.tempfile.TemporaryDirectory
   def capture_temp(*args,**kwargs):
    candidate=original_temp(*args,**kwargs);staged.append(pathlib.Path(candidate.name));return candidate
   def failing_gh(*args,binary=False):
    if args[:2]==('release','view'):return json.dumps({'id':1,'isDraft':True,'url':'https://example.invalid/draft'})
    if args[:2]==('release','upload'):raise RuntimeError('simulated remote upload failure')
    if args[0]=='api' and '/assets?' in args[1]:return '[]'
    if args[0]=='api':return json.dumps([{'id':1,'tag_name':'test'}])
    raise AssertionError(args)
   m.gh=failing_gh
   with patch.object(m.tempfile,'TemporaryDirectory',side_effect=capture_temp):
    with self.assertRaisesRegex(RuntimeError,'simulated remote upload failure'):
     m.upload(root,'owner/repo','test')
   self.assertTrue(staged,'the test must exercise actual ZIP staging')
   self.assertTrue(all(not directory.exists() for directory in staged),
                   'staged private ZIP and temporary directory must be erased on error')
   self.assertEqual((root/'desktop.mkv').read_bytes(),b'original-private-video')
   self.assertFalse((root/'UPLOAD_RECEIPT.json').exists())
 def test_live_packet_refused(self):
  with tempfile.TemporaryDirectory() as t:
   p=pathlib.Path(t);(p/'session.json').write_text(json.dumps({'state':'CAPTURING'}))
   with self.assertRaisesRegex(RuntimeError,'unfrozen/live'):m.upload(p,'owner/repo','test')
 def test_published_release_refused(self):
  with tempfile.TemporaryDirectory() as t:
   p=pathlib.Path(t);(p/'session.json').write_text(json.dumps({'state':'FROZEN','recording':{'closed':True}}))
   (p/'desktop.mkv').write_bytes(b'private-evidence')
   m.gh=lambda *a,**k:json.dumps({'id':1,'isDraft':False})
   staged=[]
   original_temp=m.tempfile.TemporaryDirectory
   def capture_temp(*args,**kwargs):
    candidate=original_temp(*args,**kwargs);staged.append(pathlib.Path(candidate.name));return candidate
   with patch.object(m.tempfile,'TemporaryDirectory',side_effect=capture_temp):
    with self.assertRaisesRegex(RuntimeError,'published'):m.upload(p,'owner/repo','test')
   self.assertTrue(staged)
   self.assertTrue(all(not directory.exists() for directory in staged))
   self.assertEqual((p/'desktop.mkv').read_bytes(),b'private-evidence')
if __name__=='__main__':unittest.main()
