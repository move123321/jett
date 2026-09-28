import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('work/psd_validation').resolve()))
from psd_tools import PSDImage
from PIL import Image
p=Path('outputs/Live2D_motion_v2')
results=[]
for manifest_name in ['layers.json','cubism_art_layers.json']:
 m=json.loads((p/manifest_name).read_text(encoding='utf-8'))
 psd=PSDImage.open(p/m['psd'])
 assert len(psd)==len(m['layers'])
 byname={l.name:l for l in psd}
 assert len(byname)==len(psd)
 for item in m['layers']:
  actual=byname[item['name']].topil().convert('RGBA')
  expected=Image.open(p/item['file']).convert('RGBA')
  assert actual.tobytes()==expected.tobytes(),item['name']
  assert actual.getchannel('A').getbbox() is not None,item['name']
 expected=Image.open(p/m['preview']).convert('RGBA')
 actual=psd.composite(force=True).convert('RGBA')
 aa=bytearray(actual.tobytes());ee=bytearray(expected.tobytes())
 for j in range(0,len(aa),4):
  if aa[j+3]==0:aa[j:j+3]=b'\0\0\0'
  if ee[j+3]==0:ee[j:j+3]=b'\0\0\0'
 assert aa==ee,m['psd']
 results.append({'file':m['psd'],'layers':len(psd),'nonemptyLayers':len(psd),'allDecodedLayerPixelsMatchPNGs':True,'independentCompositeMatchesPreview':True})
original=Image.open(p/'original.png').convert('RGBA')
neutral=Image.open(p/'neutral_exact.png').convert('RGBA')
assert original.tobytes()==neutral.tobytes()
result={'files':results,'neutralMatchesOriginalRGBA':True,'CubismGUIImportTested':False}
(p/'psd_verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result))
