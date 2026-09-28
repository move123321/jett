# Jett Live2D 작업 기록

원본 디자인을 유지하는 Live2D 파츠 준비 및 동작 미리보기 작업입니다.

## 현재 결과

- `outputs/Live2D_motion_v2/`: 최신 파츠 PSD, 투명 PNG, 리깅 계획, 브라우저 동작 미리보기와 검증 결과.
- `outputs/Live2D_motion_v2/Jett_Cubism_import_art.psd`: Cubism 가져오기용 51개 레이어 PSD.
- `outputs/Live2D_motion_v2/동작_확인.html`: 브라우저에서 열어 눈 깜빡임, 시선, 입, 눈썹 및 작은 머리/몸 움직임 확인.
- `outputs/Live2D_original_exact_v1/`: 원본 픽셀 분리 버전 및 재합성 검증.
- `outputs/model_reference/`: Blender 참고 렌더와 편집 가능한 참고 장면.
- `outputs/Live2D_art_v1/`: 채택하지 않은 이전 시안. 최신 작업의 기준 이미지가 아닙니다.
- `work/`: 제작·검증 스크립트와 실험 중인 파일.

## 진행 상태와 제한

기본 자세의 원본 픽셀 일치 및 PSD 레이어 검증은 저장된 검증 결과를 참고하세요. 브라우저 동작 미리보기는 Cubism 모델이 아닙니다. 실제 `.cmo3` / `.moc3` 파일은 아직 생성되지 않았습니다. Cubism 공식 설치 파일의 서명 확인과 실행까지 진행했으나, 설치 창 자동 조작이 시간 초과되어 설치 완료 확인이 필요합니다. 설치 위치는 사용자 요청에 따라 E드라이브입니다.

`work/rig_player_mesh.js` 및 `work/mesh_preview.html`은 아직 검증하지 않은 실험입니다. 제작 스크립트에는 작업 컴퓨터의 경로와 별도 런타임 의존성이 포함돼 있어 다른 컴퓨터에서는 경로 조정이 필요합니다.

완료된 산출물, 이전 시안, 제작 코드와 검증 자료를 함께 보관합니다. 다운로드한 설치 프로그램과 설치된 Python 의존성은 버전 관리에서 제외합니다.
