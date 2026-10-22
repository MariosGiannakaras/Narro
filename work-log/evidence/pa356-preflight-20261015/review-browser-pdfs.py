from pathlib import Path
import fitz,json
r=Path(__file__).resolve().parent;result={}
for p in r.glob('browser-91-*.pdf'):
 d=fitz.open(p);d[0].get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(p.with_suffix('.png'))
 result[p.name]={'pages':len(d),'firstPageText':d[0].get_text()}
(r/'browser-pdf-review.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({k:v['pages'] for k,v in result.items()}))
