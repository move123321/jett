from pathlib import Path
from PIL import Image
import struct, json, shutil, zipfile

out=Path('outputs'); out.mkdir(exist_ok=True)
src=Path(r'C:\Users\seogh\AppData\Local\Temp\codex-file-preview-uwAMB2\image.png')
shutil.copy2(src,out/'REFERENCE_original.png')
im=Image.open(src).convert('RGB'); w,h=im.size
groups=[]
def group(name, names, note):
    groups.append(dict(name=name,layers=names.split(),note=note))
group('90_Hair_Front','Hair_Front_Center Hair_Front_L_01 Hair_Front_L_02 Hair_Front_R_01 Hair_Front_R_02','가닥 수는 임시 슬롯. 원본 덩어리 경계에 맞춰 확정. 중앙으로 내려오는 가닥과 좌우 큰 흐름 보존.')
group('85_Hair_Side_Front','Hair_Side_L_Root Hair_Side_L_Tip Hair_Side_R_Root Hair_Side_R_Tip','긴 옆머리의 폭과 끝 위치 보존. 뿌리/끝은 겹치게 그리거나 단일 메시에서 변형 가능.')
group('80_Brows','Brow_L Brow_R','두께·각도·비대칭 보존. 앞머리 뒤에 가려진 부분까지 복원.')
for s in ['L','R']:
    group('75_Eye_'+s, ' '.join('Eye_'+s+'_'+x for x in ['LashUpper','LashLower','LidUpper','LidLower','Highlight','Pupil','Iris','White']), '눈 외곽과 눈꼬리 유지. 홍채/동공/반사는 흰자 영역에 클리핑. 눈꺼풀 피부는 닫힘을 위한 복원 필요.')
group('70_Nose','Nose_Line Nose_Shadow','코 크기와 음영 위치 유지. 선이 없는 부분에 선을 추가하지 않음.')
group('65_Mouth','Mouth_LineUpper Mouth_LineLower Mouth_LipUpper Mouth_LipLower Mouth_TeethUpper Mouth_TeethLower Mouth_Tongue Mouth_Inside','입술 색·입꼬리 보존. 치아/혀/입안은 원본에서 확인되지 않는 신규 내부 그림; 복원 작업 필요.')
group('60_Face','Face_Shading Face_Base Ear_L Ear_R','턱선·얼굴 폭·피부색 보존. 코/입 그림자를 피부 베이스와 중복시키지 않음.')
group('55_Hair_Side_Back','Hair_SideBack_L Hair_SideBack_R','귀 뒤로 통과하는 가닥만 해당. 실제 교차 관계를 확인하고 앞쪽 가닥과 분리.')
group('50_Hood_Front','Hood_Rim_L Hood_Rim_R Hood_Front_L Hood_Front_R','남색 후드의 두꺼운 테두리와 접힘 유지. 목보다 앞인 부분만 이 그룹에 배치.')
group('45_Neck','Neck_Shadow Neck_Base','턱 아래 목 연결부를 충분히 연장. 머리 회전과 몸통 회전을 분리.')
group('40_Ornaments_PENDING','ShoulderOrnament_L_Front ShoulderOrnament_R_Front ShoulderOrnament_L_Back ShoulderOrnament_R_Back','원본이 잘려 형태 확인 불가. 화면 오른쪽 물체를 어깨장식으로 단정하지 않음. 전체 원본 확보 후 사용 여부 확정.')
group('35_Arms_PENDING','Arm_L_Upper Arm_L_Forearm Hand_L Arm_R_Upper Arm_R_Forearm Hand_R','현재 이미지로 전체 팔·손 디자인 확인 불가. 새 디자인을 임의 생성하지 않음.')
group('30_Outfit_PENDING','Outfit_Collar Outfit_Front Outfit_Sleeve_L Outfit_Sleeve_R Torso_Base','하단이 잘림. 남색 계열의 보이는 부분 외 구조와 색은 원본 확인 필요.')
group('20_Hood_Back','Hood_Back Hood_Inner','보이는 후드 내부 음영 유지. 어깨 뒤 부분을 복원해야 몸통 기울기에 빈틈이 없음.')
group('10_Hair_Back','Hair_Back_Base Hair_Back_L Hair_Back_R','뒤통수 머리 질량을 유지. 후드와 겹침 순서는 실제 선화 기준으로 재확인.')
group('05_Hair_Tied','Hair_Bun_Base Hair_Bun_Fold_01 Hair_Bun_Fold_02 Hair_Bun_Loose','정수리 묶음의 실루엣 유지. 윗부분이 잘려 있어 전체 윤곽은 미확인. 긴 포니테일로 변경하지 않음.')

manifest={'status':'STRUCTURE_TEMPLATE_NOT_SEPARATED_ART','reference':{'file':'REFERENCE_original.png','width':w,'height':h,'basis':'이전 대화의 첫 번째 이미지'},'sideConvention':'L/R는 캐릭터 기준. L=화면 오른쪽, R=화면 왼쪽','order':'groups와 layers는 위에서 아래. 실제 겹침 검토 후 조정','groups':groups}
(out/'layer_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')

# PSD container assembly: unchanged reference pixels plus empty editable layer slots.
u16=lambda n:struct.pack('>H',n)
i16=lambda n:struct.pack('>h',n)
u32=lambda n:struct.pack('>I',n)
records=[]; pixels=[]
def record(name, raster=None, section=None):
    if raster is None: ww=hh=0; channels=[b'\0\0']*4
    else:
        ww,hh=raster.size; channels=[b'\0\0'+raster.getchannel(c).tobytes() for c in 'RGBA']
    encoded=name.encode('ascii'); pas=bytes([len(encoded)])+encoded; pas+=b'\0'*((-len(pas))%4)
    extra=u32(0)+u32(0)+pas
    if section is not None: extra+=b'8BIMlsct'+u32(4)+u32(section)
    rec=struct.pack('>iiiiH',0,0,hh,ww,4)
    for cid,data in zip([-1,0,1,2],[channels[3],channels[0],channels[1],channels[2]]): rec+=i16(cid)+u32(len(data))
    rec+=b'8BIMnorm'+bytes([255,0,0,0])+u32(len(extra))+extra
    records.append(rec); pixels.extend([channels[3],channels[0],channels[1],channels[2]])
# On-disk PSD layer order is bottom to top.
record('REFERENCE_ONLY_REMOVE_BEFORE_IMPORT',im.convert('RGBA'))
for g in reversed(groups):
    record('</Layer group>',section=3)
    for name in reversed(g['layers']): record(name)
    record(g['name'],section=1)
li=i16(len(records))+b''.join(records)+b''.join(pixels)
li+=b'\0'*(len(li)%2)
lm=u32(len(li))+li+u32(0)
header=b'8BPS'+u16(1)+b'\0'*6+u16(3)+u32(h)+u32(w)+u16(8)+u16(3)
composite=b'\0\0'+b''.join(im.getchannel(c).tobytes() for c in 'RGB')
(out/'Live2D_structure_TEMPLATE.psd').write_bytes(header+u32(0)+u32(0)+u32(len(lm))+lm+composite)
check=Image.open(out/'Live2D_structure_TEMPLATE.psd')
assert check.size==im.size and check.convert('RGB').tobytes()==im.tobytes()
assert len({n for g in groups for n in g['layers']})==sum(len(g['layers']) for g in groups)
print(json.dumps({'size':[w,h],'groups':len(groups),'empty_art_layers':sum(len(g['layers']) for g in groups),'PSD_composite_matches_original':True}))
