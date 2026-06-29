# CLAUDE.md — circulus-hani (또박한글)

> Claude Code가 이 저장소에서 작업할 때 참고하는 안내 문서입니다.

---

## 1. 프로젝트 개요

**또박한글**은 특수교육 대상 학생을 위한 한글 학습 웹앱이다.

| 항목        | 내용                                         |
| --------- | ------------------------------------------ |
| 런타임 / 플랫폼 | Node.js / 브라우저 (PWA)                       |
| 프레임워크     | React 19 + Vite 5                          |
| 데이터베이스    | 없음 (API 서버에 위임)                            |
| 로컬 주소     | http://localhost:5173 (기본). LAN 실기기 테스트 시 http://192.168.x.x:5173 |
| 기타        | PWA, TensorFlow.js 사용, Pretendard 폰트       |

---

## 2. 연결된 레포

| 레포  | 경로                     | 설명          |
| --- | ---------------------- | ----------- |
| BE  | `../circulus-hani-api` | 또박한글 API 서버 |

**환경별 연결 URL:**

| 환경  | URL                           |
| --- | ----------------------------- |
| 로컬  | http://localhost:59421/v1     |
| 운영  | https://hani-api.circul.us/v1 |

---

## 3. 기술 스택

| 레이어      | 기술                                         |
| -------- | ------------------------------------------ |
| UI 프레임워크 | React 19, React Router DOM v7              |
| 빌드       | Vite 5 + vite-plugin-pwa                   |
| 스타일      | Tailwind CSS v3, shadcn/ui (Radix UI 기반)   |
| 상태 관리    | TanStack Query v5, localStorage            |
| 폼        | react-hook-form + zod                      |
| 날짜       | dayjs (ko 로케일, 플러그인 다수)                    |
| AI/ML    | TensorFlow.js                              |
| 애니메이션    | Motion (Framer Motion 후속), canvas-confetti |
| 드래그앤드롭   | @hello-pangea/dnd                          |
| 아이콘      | lucide-react, @radix-ui/react-icons        |

---

## 4. 명령어

```bash
# 개발 서버 (ops 모드, --host로 LAN 노출) → http://localhost:5173 접속
npm run dev

# 프로덕션 빌드
npm run build

# 린트
npm run lint

# 빌드 결과 미리보기
npm run preview
```

---

## 5. 아키텍처

### 엔트리포인트 흐름

```
index.html
  └─ src/main.jsx
       ├─ dayjs 플러그인 / 로케일 초기화
       ├─ getUserData() → 토큰 검증 (loader)
       ├─ QueryProvider (TanStack Query)
       └─ RouterProvider (createBrowserRouter)
```

### 라우트 구조

| 경로                                 | 대상     | 설명                              |
| ---------------------------------- | ------ | ------------------------------- |
| `/`                                | 모든 사용자 | 메인(대시보드 진입)                     |
| `/login/teacher`, `/login/student` | 미인증    | 로그인                             |
| `/manage/*`                        | 교사     | DashboardLayout — 그룹·학생·커리큘럼 관리 |
| `/learn/*`                         | 학생     | LearnLayout — 한글 학습 흐름          |
| `/legacy/*`                        | (구)    | 레거시 대시보드                        |

### 주요 모듈 / 서비스

| 파일·디렉토리                           | 역할                                                          |
| --------------------------------- | ----------------------------------------------------------- |
| `src/api/index.js`                | fetch 래퍼 (get/post/put/patch/del), 토큰 인증                    |
| `src/api/learning.js`             | 학습 관련 API 호출                                                |
| `src/api/session.js`              | 세션 관련 API 호출                                                |
| `src/components/dashboard/`       | 교사 대시보드 컴포넌트들                                               |
| `src/features/`                   | 학습 뷰 (자음·모음·음절·단어)                                          |
| `src/layouts/`                    | AuthLayout / DashboardLayout / LearnLayout / ProgressLayout |
| `src/hook/`                       | 커스텀 훅 모음                                                    |
| `src/providers/QueryProvider.jsx` | TanStack Query 설정                                           |
| `src/lib/utils.js`                | shadcn/ui `cn()` 유틸                                         |
| `src/utils/reorder.js`            | 드래그앤드롭 순서 변경 유틸                                             |

### 디렉토리 구조

```
circulus-hani/
├── src/
│   ├── api/          # fetch 래퍼 및 도메인별 API
│   ├── assets/       # SVG 아이콘
│   ├── components/   # 공통 컴포넌트 (ui/, dashboard/, magicui/)
│   ├── data/         # 정적 학습 데이터 JSON
│   ├── features/     # 학습 뷰 (자음·모음·음절·단어)
│   ├── hook/         # 커스텀 훅
│   ├── layouts/      # 레이아웃 컴포넌트
│   ├── lib/          # 유틸리티
│   ├── pages/        # 페이지 컴포넌트
│   ├── providers/    # Context/Query 프로바이더
│   ├── styles/       # 글로벌 CSS, Pretendard 폰트
│   └── utils/        # 기타 유틸
├── public/           # 정적 파일 (아이콘, favicon)
├── vite.config.js
└── ...
```

---

## 6. 인증

- **방식**: JWT (Bearer Token)
- **토큰 전달**: `localStorage`에 `"token"` 키로 저장 → API 요청 시 `Authorization: Bearer` 헤더
- **검증 흐름**: 앱 진입 시 `getUserData()` → `GET /auth/check` 호출 → 실패 시 `null` 반환 (리다이렉트는 AuthLayout에서 처리)
- **현재 상태**: 토큰 자동 refresh 미구현 (만료 시 재로그인 필요)

---

## 7. 에러 응답 포맷

**성공**

```json
{ "result": true, "data": { ... } }
```

**실패**

```json
{ "result": false, "error": "에러 메시지" }
```

---

## 8. 주요 제약 / 주의사항

- 음성인식·카메라는 보안 컨텍스트(secure context) 요구. **`localhost`는 HTTP여도 인정되므로 `http://localhost:5173` 개발에는 HTTPS 불필요.** HTTPS는 LAN IP(`http://192.168.x.x`)로 실기기를 테스트할 때만 필요
- (실기기 LAN 테스트 시) mkcert로 인증서 발급 후 `vite.config.js`에 `server.https` 추가 필요. 과거 메모의 `192.168.0.103+3-key.pem`/`192.168.0.103+3.pem`(상위 `../`)은 특정 개발자가 수동 구성했던 흔적이며 현재 레포에는 반영돼 있지 않음(`vite.config.js`에 `server.https` 없음)
- 빌드 모드: dev → `ops`, 배포 → `prod` (환경변수 파일 분리)
- TensorFlow.js 모델 관련 파일은 캐시 용량이 크므로 PWA workbox 설정에서 5MB 제한 적용 중

---

## 9. 운영 시 주의사항

- 운영 API: `https://hani-api.circul.us/v1` — BE 레포(`circulus-hani-api`) 별도 배포 필요
- 공통 배포 스크립트 `~/Documents/DEV/pub-front.sh`로 빌드 후 배포 (`pub-front.sh circulus-hani OPS|STG`, SSH 키 `circulus.pem` 필요, 내용 확인 후 실행)
- PWA `registerType: "autoUpdate"` 설정으로 서비스워커 자동 갱신됨 — 정적 자산 캐시 주의
