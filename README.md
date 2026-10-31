# 인프라대시 06

[사이트 열기](https://majitap.github.io/infradash-codex6/) · [실제 데이터 연결 가이드](docs/START-HERE.md)

밝은 운영 화면과 짙은 남색의 구성 요소 카드, 한글 정보 구조, 8px 간격으로 새롭게 다듬은 깃랩 인프라 대시보드입니다.

## 주요 기능

- 상단의 작은 라이선스 표시와 한 줄 연결 상태 요약
- 기간별 지표, 곡선·막대 차트, 날짜별 수치 확인, 실행 필터와 상세 보기
- 파일 가져오기와 인증된 수집 주소 연결, 30초 자동 갱신, 오래된 데이터·오류·미수집 처리
- 지정한 깃랩 프로젝트만 읽는 수집 명령과 한글 리포트 저장
- 서비스 구성 요소 선택, 확인할 항목 상세 보기
- 10개 상위 메뉴와 기존 분석 화면, 검색, 밝은 화면·어두운 화면, 모바일 메뉴
- 자체 호스팅 한글 폰트, 키보드 포커스, 모션 감소 설정 지원

## 내일부터 실제 데이터 사용

공개 배포는 예시 데이터로 시작합니다. 상단 952/1000도 예시입니다. 실제 수집 결과를 가져오면 개요가 해당 데이터로 바뀝니다. 토큰과 사내 운영 정보는 공개 사이트에 포함하지 않습니다.

1. 로컬에서 npm ci 실행
2. .env.example을 .env.collector.local로 복사해 깃랩 주소·읽기 토큰·프로젝트 번호 설정
3. npm run dashboard:collect 실행
4. 사이트의 데이터 연결에서 .local/dashboard-live.json 가져오기

자세한 설정, 집계 기준과 지원 범위는 [시작 가이드](docs/START-HERE.md)에 정리했습니다. **개요 외 상세 분석 화면은 예시 데이터**이며 실제 운영 API의 라이선스·연결 상태·로그 기능은 별도 연동합니다.

## 개발과 검증

```sh
npm ci
npm run dev
npm test
npm run lint
npm run check:spacing
npx tsc --noEmit
npm run build
```

로컬 경로는 /infradash-codex6/입니다. GitHub Actions에서 자동 검증 후 정적 파일을 GitHub Pages로 배포합니다. 수집 주소는 Actions의 공개 주소 변수로 설정할 수 있습니다.

## 계승과 라이선스

[인프라대시 05](https://github.com/majitap/infradash-codex5)의 데이터 모델과 분석 기능을 계승했습니다. Git 기록과 [원본 설명](README.gemini.md)을 보존합니다. 폰트 라이선스는 public/licenses/에 있습니다.
