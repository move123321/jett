import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('work/psd_validation').resolve()))
from psd_tools import PSDImage
from PIL import Image
p=Path('outputs/Live2D_original_exact_v1')
psd=PSDImage.open(p/'Jett_ORIGINAL_pixels_layers.psd')
manifest=json.loads((p/'layers.json').read_text(encoding='utf-8'))
ref=Image.open(p/'original.png').convert('RGBA')
assert len(psd)==len(manifest['layers'])==40
byname={l.name:l for l in psd}
checks=[]
for item in manifest['layers']:
 layer=byname[item['name']]
 raster=layer.topil().convert('RGBA')
 expected=Image.open(p/item['file']).convert('RGBA')
 assert raster.tobytes()==expected.tobytes(),item['name']
 checks.append({'layer':item['name'],'decodedPixelsMatch':True,'nonemptyPixels':item['pixels']})
composite=psd.composite(force=True).convert('RGBA')
assert composite.tobytes()==ref.tobytes(),'Independent layer composite differs'
result={'width':psd.width,'height':psd.height,'layers':len(psd),'emptyLayers':0,'individualLayerDecodeVerified':True,'independentLayerCompositeEqualsOriginalRGBA':True,'photoshopOrCubismGUIValidation':False,'layersVerified':checks}
(p/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='layersVerified'}))
