import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('work/psd_validation').resolve()))
from psd_tools import PSDImage
from PIL import Image
p=Path('outputs/Jett_SD_Live2D_v1')
m=json.loads((p/'layers.json').read_text())
d=PSDImage.open(p/m['psd'])
assert len(d)==len(m['layers'])
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
# Underpainting fills alpha 250..254 source pixels; that can change channels by up to 5.
assert delta<=5,'Unexpected composite difference: '+str(delta)
assert all(aa[i:i+4]==bb[i:i+4] for i in range(0,len(aa),4) if aa[i+3]==255)
import numpy as np
original=np.array(a); partition=np.zeros_like(original); occupancy=np.zeros(original.shape[:2],dtype=np.uint8)
for item in m['layers']:
 if item['hidden'] or item['name'].startswith('Restore_'):continue
 part=np.array(Image.open(p/item['file']).convert('RGBA'));y=item['y'];x=item['x'];h,w=part.shape[:2]
 mask=part[:,:,3]>0;view=partition[y:y+h,x:x+w];view[mask]=part[mask]
 occupancy[y:y+h,x:x+w]+=mask
assert np.all(occupancy[original[:,:,3]>0]==1),'Partition overlap or missing source pixel'
assert np.array_equal(partition[original[:,:,3]>0],original[original[:,:,3]>0]),'Original art pixel changed'
r={'layerCount':len(d),'layerPNGPixelsVerified':True,'neutralOpaquePixelsEqualMaster':True,'maxCompositeChannelRoundingDifference':delta,'cubismImportVerified':True,'nativeModelCreated':True,'nativeRigComplete':False,'verifiedNativeParameters':['ParamEyeLOpen','ParamEyeROpen','ParamMouthOpenY','ParamBodyAngleZ','ParamAngleZ'],'eyeAndMouthMethod':'opacity crossfade between alternate art','headRotationDegrees':[-5,0,5],'bodyRotationDegrees':[-3,0,3],'remaining':['eye gaze XY and white underpainting','brows','head XY','hair hood accessory physics','neck overlap cleanup','runtime export and tracking test']}
(p/'verification.json').write_text(json.dumps(r,indent=2))
print(json.dumps(r))
