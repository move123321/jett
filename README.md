# Jett Live2D 작업 기록

원본 디자인을 유지하는 Live2D 파츠 준비 및 동작 미리보기 작업입니다.

## 웹에서 바로 실행

[간단한 SD 아바타 열기](https://move123321.github.io/jett/sd/) — 자동 깜빡임, 말하기 미리보기, 마이크 음량 반응. 이미지 4장을 전환하는 방식이며 Cubism 리깅 모델은 아닙니다. 편집용 PNG와 4개 표정 레이어 PSD는 `outputs/Jett_SD_v1/`에 있습니다.

[제트 동작 미리보기 열기](https://move123321.github.io/jett/)

설치 없이 브라우저에서 실행할 수 있습니다. `docs/index.html`이 GitHub Pages 배포본입니다.

## 현재 결과

- `outputs/Live2D_motion_v2/`: 최신 파츠 PSD, 투명 PNG, 리깅 계획, 브라우저 동작 미리보기와 검증 결과.
- `outputs/Live2D_motion_v2/Jett_Cubism_import_art.psd`: Cubism 가져오기용 51개 레이어 PSD.
- `outputs/Live2D_motion_v2/동작_확인.html`: 브라우저에서 열어 눈 깜빡임, 시선, 입, 눈썹 및 작은 머리/몸 움직임 확인.
- `outputs/Live2D_original_exact_v1/`: 원본 픽셀 분리 버전 및 재합성 검증.
- `outputs/model_reference/`: Blender 참고 렌더와 편집 가능한 참고 장면.
- `outputs/Live2D_art_v1/`: 채택하지 않은 이전 시안. 최신 작업의 기준 이미지가 아닙니다.
- `work/`: 제작·검증 스크립트와 실험 중인 파일.

## 진행 상태와 제한

실제 Cubism SD 모델은 `outputs/Jett_SD_Live2D_v1/Jett_SD_rig.cmo3`입니다. Cubism Editor 5.3.04 FREE에서 눈 깜빡임, 입 열림, 고개 Z, 몸 전체 Z 기울기를 연결하고 저장 검증을 통과했습니다. 원본 그림을 분리한 PSD는 30개 레이어이며 원본 픽셀의 누락·중복 검증을 통과했습니다.

`outputs/Jett_SD_Live2D_v1/runtime/Jett_SD.model3.json`과 `.moc3`, 2048 텍스처도 Cubism 4.2 호환으로 내보냈습니다. 외부 뷰어 실행 승인이 시간 초과되어 외부 재생 및 카메라 추적은 미검증입니다. 완성 리깅은 아닙니다. 시선 XY, 눈썹, 고개 XY, 머리·후드 물리와 목 경계 보정이 남았습니다. 눈·입은 대체 그림의 불투명도 전환을 사용합니다. 자세한 상태는 해당 폴더의 `리깅_작업표.md`를 참고하세요.

브라우저 동작 미리보기는 별도 HTML 데모입니다. 설치된 Cubism 위치는 사용자 요청대로 E드라이브입니다.

`work/rig_player_mesh.js` 및 `work/mesh_preview.html`은 아직 검증하지 않은 실험입니다. 제작 스크립트에는 작업 컴퓨터의 경로와 별도 런타임 의존성이 포함돼 있어 다른 컴퓨터에서는 경로 조정이 필요합니다.

완료된 산출물, 이전 시안, 제작 코드와 검증 자료를 함께 보관합니다. 다운로드한 설치 프로그램과 설치된 Python 의존성은 버전 관리에서 제외합니다.
