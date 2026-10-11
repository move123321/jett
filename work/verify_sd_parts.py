import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('work/psd_validation').resolve()))
from psd_tools import PSDImage
from PIL import Image
p=Path('outputs/Jett_SD_Live2D_v1')
m=json.loads((p/'layers.json').read_text())
d=PSDImage.open(p/m['psd'])
assert len(d)==29
for layer,item in zip(d,m['layers']):
 assert layer.name==item['name']
 assert layer.topil().convert('RGBA').tobytes()==Image.open(p/item['file']).convert('RGBA').tobytes(),layer.name
 assert layer.visible == (not item['hidden'])
a=Image.open(p/'SD_master.png').convert('RGBA');b=Image.open(p/m['preview']).convert('RGBA')
aa=bytearray(a.tobytes());bb=bytearray(b.tobytes())
for i in range(0,len(aa),4):
 if aa[i+3]==0:aa[i:i+3]=b'\0\0\0'
 if bb[i+3]==0:bb[i:i+3]=b'\0\0\0'
delta=max(abs(x-y) for x,y in zip(aa,bb))
assert delta<=1,'Unexpected composite difference'
assert all(aa[i:i+4]==bb[i:i+4] for i in range(0,len(aa),4) if aa[i+3]==255)
r={'layerCount':len(d),'layerPNGPixelsVerified':True,'neutralOpaquePixelsEqualMaster':True,'maxCompositeChannelRoundingDifference':delta,'cubismImportVerified':False,'nativeModelCreated':False}
(p/'verification.json').write_text(json.dumps(r,indent=2))
print(json.dumps(r))
