import importlib.util,pathlib,tempfile,json,unittest,hashlib,time
spec=importlib.util.spec_from_file_location('uploader',pathlib.Path(__file__).with_name('upload-physical-evidence.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class TransferTests(unittest.TestCase):
 def test_frozen_transfer_and_retry(self):
  with tempfile.TemporaryDirectory() as t:
   root=pathlib.Path(t)/'session';root.mkdir();(root/'session.json').write_text(json.dumps({'state':'FROZEN','recording':{'closed':True}}));(root/'desktop.mkv').write_bytes(b'original-video');assets=[]
   def fake(*a,binary=False):
    if a[:2]==('release','view'):return json.dumps({'id':'graphql-id','isDraft':True,'url':'https://example.invalid/draft'})
    if a[:2]==('release','upload'):
     p=pathlib.Path(a[3]);assets.append({'id':7,'name':p.name,'size':p.stat().st_size,'digest':'sha256:'+m.digest(p)});return ''
    if a[0]=='api' and '/assets?' in a[1]:return json.dumps(assets)
    if a[0]=='api':return json.dumps([{'id':1,'tag_name':'test'}])
    raise AssertionError(a)
   m.gh=fake
   a=m.upload(root,'owner/repo','test');time.sleep(2.1);b=m.upload(root,'owner/repo','test')
   self.assertEqual(a['status'],'UPLOADED_VERIFIED');self.assertEqual(a['sha256'],b['sha256']);self.assertEqual(len(assets),1)
   self.assertEqual((root/'desktop.mkv').read_bytes(),b'original-video')
 def test_live_packet_refused(self):
  with tempfile.TemporaryDirectory() as t:
   p=pathlib.Path(t);(p/'session.json').write_text(json.dumps({'state':'CAPTURING'}))
   with self.assertRaisesRegex(RuntimeError,'unfrozen/live'):m.upload(p,'owner/repo','test')
 def test_published_release_refused(self):
  with tempfile.TemporaryDirectory() as t:
   p=pathlib.Path(t);(p/'session.json').write_text(json.dumps({'state':'FROZEN','recording':{'closed':True}}));m.gh=lambda *a,**k:json.dumps({'id':1,'isDraft':False})
   with self.assertRaisesRegex(RuntimeError,'published'):m.upload(p,'owner/repo','test')
if __name__=='__main__':unittest.main()
