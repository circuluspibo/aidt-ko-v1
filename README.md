# 또박한글 (circulus-hani)

> 특수교육 대상 학생이 한글을 단계별로 배우고, 선생님이 그 과정을 관리·점검하는 학습 웹앱입니다.

---

## 목차

**📁 프로젝트 이해 (누구나)**

1. [프로젝트 개요](#1-프로젝트-개요)
2. [주요 화면](#2-주요-화면)
3. [사용자 시나리오](#3-사용자-시나리오)
4. [용어 풀이](#4-용어-풀이)

**🛠 개발 문서 (개발자)**

5. [기술 스택](#5-기술-스택)
6. [로컬 개발환경 세팅](#6-로컬-개발환경-세팅)
7. [주요 기능 및 코드 설명](#7-주요-기능-및-코드-설명)
8. [API 연동 방식](#8-api-연동-방식)
9. [환경변수](#9-환경변수)
10. [빌드 및 배포](#10-빌드-및-배포)
11. [트러블슈팅](#11-트러블슈팅)
12. [알려진 이슈 / 기술부채](#12-알려진-이슈--기술부채)

---

## 1. 프로젝트 개요

**또박한글**은 발달장애·느린 학습자 등 **특수교육이 필요한 학생을 위한 한글 학습 앱**입니다.
일반 학습지로는 따라가기 어려운 학생들이, 자기 속도에 맞춰 자음·모음부터 낱말까지 반복하며 익힐 수 있도록 만들어졌습니다. 학생은 게임처럼 재미있게 학습하고, 선생님은 학생이 무엇을 얼마나 잘하는지 한눈에 확인할 수 있습니다.

이 저장소는 그중 **화면(웹앱) 부분**이며, 학습 데이터는 별도의 서버([연관 레포](#2-연관-레포) 참고)가 담당합니다.

### 이런 걸 할 수 있어요

**👩‍🏫 선생님 (교사)**

- 학생을 그룹으로 묶어 관리하고, 학생마다 학습할 한글 커리큘럼을 정해줍니다.
- 학생별 학습 현황(얼마나 했고 정답률은 어떤지)을 통계·그래프로 봅니다.
- 학생별 **개별화 학습 보고서(IEP 리포트)**를 확인합니다.

**🧒 학생**

- 선생님이 알려준 **학습 코드**만 입력하면 바로 학습을 시작합니다 (아이디·비밀번호 없음).
- 자기 캐릭터(친구)를 고르고, 배울 한글과 방법(읽기·듣기·말하기·쓰기)을 선택해 학습합니다.
- 카메라·마이크로 집중도와 발음을 확인하고, 손글씨를 직접 써서 채점받습니다.

### 기술적 특징

- **앱처럼 설치되는 웹사이트 (PWA)**: 웹사이트지만 앱처럼 동작합니다. 별도의 앱스토어 설치 없이 브라우저 주소로 바로 접속할 수 있고, 원하면 "홈 화면에 추가"로 일반 앱처럼 아이콘을 만들어 쓸 수도 있습니다. 서비스워커가 화면을 구성하는 파일들을 미리 받아 두기 때문에, 한 번 접속한 뒤에는 로딩이 빨라지고 네트워크가 잠시 끊겨도 화면이 동작합니다. 새 버전이 배포되면 자동으로 갱신됩니다.

- **손글씨 인식 (자음·모음은 브라우저 안에서, 글자·낱말은 서버에서)**: 학생이 화면에 직접 써 보는 "쓰기" 학습을 위해 두 가지 방식의 손글씨 인식을 함께 씁니다. 자음·모음 같은 단순한 글자는 브라우저 안에서 동작하는 AI 모델(TensorFlow.js)이 바로 채점하므로 서버를 거치지 않아 빠르고, 글자·낱말처럼 복잡한 입력은 서버의 문자 인식(OCR)에 맡겨 정확도를 높입니다.

- **음성 인식으로 발음 확인**: "말하기" 학습에서는 마이크로 학생의 발음을 받아, 제시된 글자를 제대로 읽었는지 확인합니다. (마이크 사용을 위해 보안 연결(HTTPS)이 필요합니다.)

- **카메라 기반 집중도 측정**: 학습 중 카메라로 학생이 화면을 잘 보고 있는지 등을 감지해 집중 상태를 파악합니다. 선생님이 학생의 학습 태도를 참고할 수 있도록 돕는 보조 지표입니다.

> 카메라·마이크·AI 인식 기능은 학생의 학습을 돕기 위한 것으로, 영상·음성은 인식 처리에만 쓰입니다.

### 연관 레포

| 구분                     | 레포                   | 설명                           |
| ------------------------ | ---------------------- | ------------------------------ |
| 학습 데이터 서버(백엔드) | `../circulus-hani-api` | 또박한글 API 서버 (Fastify v5) |

---

## 2. 주요 화면

> 📸 **스크린샷 자리** — 실제 화면 이미지를 캡처해 아래 자리에 넣어주세요. 비개발자가 가장 빠르게 이해하는 자료입니다.

| 화면               | 설명                                                     | 이미지                                           |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------ |
| 로그인 (교사/학생) | 교사는 아이디·비밀번호, 학생은 "학습 코드"로 로그인      | `![로그인](docs/images/login.png)` _(추가 예정)_ |
| 교사 대시보드      | 활동 학생 수·평균 정답률 등 핵심 지표와 학습 통계 그래프 | _(추가 예정)_                                    |
| 커리큘럼 관리      | 학생/그룹별로 배울 한글을 정하고 순서를 조정             | _(추가 예정)_                                    |
| IEP 리포트         | 학생 한 명의 개별 학습 성취 보고서                       | _(추가 예정)_                                    |
| 학생 캐릭터 선택   | "나는 누구일까요?" 친구 캐릭터 고르기                    | _(추가 예정)_                                    |
| 학습 화면          | 읽기·듣기·말하기·쓰기 중 한 방식으로 한글 연습           | _(추가 예정)_                                    |

---

## 3. 사용자 시나리오

### 👩‍🏫 선생님이 학생을 학습시키기까지

1. 선생님이 자기 계정(아이디/비밀번호)으로 로그인합니다.
2. 학생들을 **그룹**으로 묶고, 학생(캐릭터)을 등록합니다.
3. 학생마다 배울 한글(**커리큘럼**)을 정하고 순서를 조정합니다.
4. 학생에게 **학습 코드**를 알려줍니다.
5. 학생이 학습을 마치면, 대시보드와 **IEP 리포트**로 진척과 성취를 확인합니다.

### 🧒 학생이 한글을 배우는 흐름

1. 선생님께 받은 **학습 코드**를 입력해 로그인합니다.
2. 마음에 드는 **친구 캐릭터**(뚜디·루루·포니 등)를 고릅니다.
3. **무엇을 배울지**(모음·자음·글자·낱말)와 **어떻게 배울지**(읽기·듣기·말하기·쓰기)를 차례로 고릅니다.
4. 문제를 풀며 한글을 익힙니다. 정답이면 칭찬 효과음과 함께 다음으로, 틀리면 다시 도전합니다.
5. 한 단계를 끝내면 자동으로 다음 학습으로 넘어가고, 모두 끝나면 축하 메시지가 나옵니다.

> 💡 학습 도중 화면은 **카메라로 집중도를, 마이크로 발음을, 손글씨를 인식**해 학생이 제대로 따라오고 있는지 확인합니다. (마이크·카메라 기능은 보안상 HTTPS 환경에서만 동작)

---

## 4. 용어 풀이

문서·코드에 자주 나오는 용어를 비전문가용으로 풀어 정리했습니다.

| 용어                  | 쉬운 설명                                                                    |
| --------------------- | ---------------------------------------------------------------------------- |
| **PWA**               | 앱처럼 설치·사용할 수 있는 웹사이트. 앱스토어 없이 브라우저로 동작.          |
| **프론트엔드**        | 사용자가 직접 보고 만지는 화면 부분. (반대말: 데이터를 처리하는 서버=백엔드) |
| **API / 백엔드 서버** | 화면이 데이터를 주고받는 상대. 학습 기록·문제 등을 보관·계산하는 곳.         |
| **OCR**               | 손으로 쓴 글씨를 컴퓨터가 글자로 알아보는 기술. (쓰기 채점에 사용)           |
| **음성 인식 (STT)**   | 사람이 말한 소리를 글자로 바꾸는 기술. (말하기 채점에 사용)                  |
| **TTS**               | 글자를 소리로 읽어주는 기술. (발음 예시 들려주기에 사용)                     |
| **IEP 리포트**        | 개별화교육계획 보고서. 학생 한 명의 학습 성취를 정리한 문서.                 |
| **집중도 모니터링**   | 카메라·응답 패턴으로 학생이 집중하고 있는지 측정하는 기능.                   |
| **커리큘럼**          | 학생이 배울 한글의 구성과 순서.                                              |
| **학습 코드**         | 학생이 로그인할 때 쓰는 코드. 선생님이 발급.                                 |
| **JWT / 토큰**        | 로그인한 사용자임을 증명하는 디지털 출입증.                                  |
| **TensorFlow.js**     | 브라우저에서 인공지능 모델을 돌리는 도구. (손글씨 자모 인식·집중도에 사용)   |

---

## 5. 기술 스택

| 분류           | 기술                     | 버전               | 용도                                   |
| -------------- | ------------------------ | ------------------ | -------------------------------------- |
| 프레임워크     | React                    | ^19.1.0            | UI 구성                                |
| 빌드 도구      | Vite                     | ^5.4.19            | 번들링 및 개발 서버                    |
| PWA            | vite-plugin-pwa          | ^1.0.1             | 앱 설치형 웹(서비스워커·매니페스트)    |
| 라우팅         | react-router-dom         | ^7.8.1             | 페이지 이동 관리 (createBrowserRouter) |
| 서버 상태 관리 | @tanstack/react-query    | ^5.83.0            | API 데이터 캐싱·동기화                 |
| 폼             | react-hook-form + zod    | ^7.62.0 / ^4.0.17  | 입력 폼 상태·검증                      |
| 스타일링       | tailwindcss              | ^3.4.17            | 화면 스타일                            |
| UI 컴포넌트    | @radix-ui/\* (shadcn/ui) | -                  | 버튼·다이얼로그 등 UI 부품             |
| AI/ML          | @tensorflow/tfjs         | ^4.22.0            | 손글씨 자모 인식 + 집중도 모니터링     |
| 차트           | recharts                 | ^3.1.2             | 대시보드·리포트 그래프                 |
| 날짜           | dayjs                    | ^1.11.13           | 날짜 포맷 (ko 로케일)                  |
| 애니메이션     | motion / canvas-confetti | ^12.23.12 / ^1.9.3 | 전환 애니메이션·정답 축하 효과         |
| 드래그앤드롭   | @hello-pangea/dnd        | ^18.0.1            | 커리큘럼 순서 변경                     |
| 아이콘         | lucide-react             | ^0.525.0           | 아이콘                                 |

> 정확한 버전은 `package.json`의 `dependencies` 기준입니다.

---

## 6. 로컬 개발환경 세팅

### 요구사항

- Node.js: `v20.19.3` (`.nvmrc` 기준)
- 패키지 매니저: npm (`package-lock.json` 존재)

### 설치 및 실행

```bash
git clone https://github.com/circuluspibo/circulus-hani.git
cd circulus-hani
npm install
npm run dev   # ops 모드, LAN 노출 (--host --mode ops)
```

위 명령으로 뜨는 주소 중 `http://localhost:5173`으로 접속하면 본인 PC에서 바로 개발할 수 있습니다.

### 백엔드 연결

이 앱은 데이터를 직접 들고 있지 않고 모두 백엔드 API 서버에서 받아옵니다. 어디에 붙을지는 `.env.ops.local`의 `VITE_API_URL`(9장)로 정해집니다.

로컬 개발은 **로컬 백엔드(`../circulus-hani-api`, `http://localhost:59421/v1`)에 붙이는 것이 기본**입니다. 프론트엔드를 실행하기 전에 백엔드를 먼저 띄우세요.

```bash
cd ../circulus-hani-api
npm install
npm run dev   # CIRCULUS_ENV=LOC-OPS, http://localhost:59421
```

`.env.ops.local`에서 `VITE_API_URL`이 로컬 주소를 가리키는지 확인하세요. 백엔드 세팅 상세는 `../circulus-hani-api`의 README를 참고합니다.

```env
VITE_API_URL=http://localhost:59421/v1
# VITE_API_URL=https://hani-api.circul.us/v1
```

> 프론트엔드만 빠르게 확인하는 등 필요할 때는 `VITE_API_URL`을 운영 도메인(`https://hani-api.circul.us/v1`)으로 잠시 바꿔 운영 데이터에 붙일 수도 있습니다. 단 운영 서버에 직접 붙으므로 데이터 변경은 신중히 하세요. (레포에 커밋된 `.env.ops.local`이 운영 도메인으로 설정되어 있을 수 있으니, 로컬 개발 시 로컬 주소로 되돌렸는지 확인하세요.)

### 테스트 계정 만들기

신규 로그인을 테스트하려면 교사 계정이 필요합니다. 연결된 백엔드에 직접 요청해 만듭니다.

1. 백엔드에 `POST /v1/teachers`로 교사 계정을 생성합니다. (요청 본문 필드는 백엔드 `/teachers` 스펙을 확인하세요.)
2. 생성한 계정으로 `/login/teacher`에서 로그인합니다.
3. 교사 대시보드에서 학생(캐릭터)을 만들고 **학습 코드**를 발급합니다.
4. 그 학습 코드로 `/login/student`에서 학생 로그인을 테스트합니다.

### HTTPS 관련 안내

본인 PC의 `localhost` 개발에는 HTTPS가 필요하지 않습니다. 음성 인식·카메라 기능은 브라우저의 보안 컨텍스트(secure context)를 요구하지만, `localhost`는 HTTP여도 보안 컨텍스트로 인정되므로 `http://localhost:5173`에서 마이크·카메라가 정상 동작합니다.

HTTPS가 필요한 경우는 태블릿이나 다른 PC 같은 실기기를 같은 LAN의 IP 주소(예: `http://192.168.0.103:5173`)로 접속해 테스트할 때입니다. `npm run dev`의 `--host` 옵션이 이 LAN 주소를 노출하는데, LAN IP는 보안 컨텍스트가 아니어서 이때만 마이크·카메라가 막힙니다. 이 경우 mkcert 등으로 인증서를 발급한 뒤 `vite.config.js`에 `server.https` 설정을 추가하면 dev 서버를 HTTPS로 띄울 수 있습니다. 설정 예시는 [Vite `server.https` 문서](https://vite.dev/config/server-options.html#server-https)를 참고하세요.

현재 레포의 `vite.config.js`에는 `server.https` 설정이 없으며 dev 서버는 기본 HTTP로 동작합니다.

---

## 7. 주요 기능 및 코드 설명

### 7-0. 디렉토리 구조 / 경로 별칭

소스는 `src/` 아래에 역할별로 나뉘어 있습니다.

| 경로             | 역할                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| `src/main.jsx`   | 앱 진입점. 라우터 정의·`loader` 인증·프로바이더 구성                                   |
| `src/api/`       | API 호출. `index.js`(fetch 래퍼), `learning.js`·`session.js`(도메인별 호출)           |
| `src/pages/`     | 라우트 단위 페이지. 학생 학습 흐름(`Character`·`Target`·`Method`·`Learn`)과 로그인 등  |
| `src/components/`| 재사용 컴포넌트. 학습 방식 실행 컴포넌트(`LearnByRead`·`LearnByListen`·`LearnBySpeak`·`LearnByWrite`), 로그인 폼, 다이얼로그 등 |
| `src/components/ui/` | shadcn/ui 기반 UI 부품(버튼·다이얼로그 등)                                          |
| `src/features/`  | 학습/대시보드 화면 요소. `dashboard/`(교사 대시보드), `ConcentrationAlert`·`Options`·`TopContentList` |
| `src/context/`   | 전역 상태. `AuthContext`(인증), `SessionContext`(학습 세션)                           |
| `src/hook/`      | 커스텀 훅. 집중도 모니터링·분석 데이터 조회 등                                         |
| `src/layouts/`   | 레이아웃. `AuthLayout`·`DashboardLayout`·`LearnLayout`·`ProgressLayout`               |
| `src/providers/` | `QueryProvider`(TanStack Query 설정)                                                   |
| `src/data/`      | 정적 JSON 데이터(`learningData.json`·`dict.json` 등)                                   |
| `src/lib/`       | `utils.js`(shadcn `cn()` 등 공통 유틸)                                                 |
| `src/utils/`     | 기타 유틸. `globals.js`(`TARGETS`/`METHODS` 매핑), `reorder.js`(드래그앤드롭 순서)     |
| `src/styles/`    | 글로벌 CSS, Pretendard 폰트                                                            |

**경로 별칭**: `vite.config.js`에서 `@`를 `src/`로 매핑합니다. 따라서 `@/components/...`는 `src/components/...`를 가리킵니다(코드 전반에서 이 형식을 사용).

**주의 — `components/`와 `features/` 구분이 깔끔하지 않습니다.** 실제로 사용하는 학습 방식 컴포넌트는 `src/components/LearnBy*`(이며 `pages/Learn.jsx`가 `method` 값으로 골라 렌더링)입니다. 반면 `src/features/`의 `VowelView`·`ConsonantView`·`SyllableView`·`WordView`는 현재 **어디서도 import되지 않는 미사용(레거시) 파일**로 보입니다. 학습 화면 코드를 찾을 때는 `features/`의 `*View`가 아니라 `components/LearnBy*`를 보세요.

**주의 — `src/data/`의 JSON과 `src/routes/`.** `src/data/`의 `learningData.json`·`dict.json` 등은 현재 코드에서 정적으로 import되지 않습니다(실제 학습 콘텐츠는 서버 응답 `data.contents`에서 옵니다). 참고용/레거시로 추정되며, 실제 사용 여부는 정리 시 확인이 필요합니다. `src/routes/`는 현재 빈 폴더입니다.

### 7-1. 인증 및 로그인 (교사 / 학생)

**관련 파일**

- `src/main.jsx` — 라우터 정의 및 진입 시 `loader`로 사용자 인증
- `src/api/index.js` — `getUserData()` 토큰 검증, `userSignIn()` 로그인 API
- `src/layouts/AuthLayout.jsx` — 최상위 레이아웃, 인증 결과를 `AuthProvider`에 전달
- `src/context/AuthContext.jsx` — 로그인/로그아웃·역할별 리다이렉트 전역 관리
- `src/pages/Login.jsx` — `target` 값으로 교사/학생 폼 분기
- `src/components/LoginForm.jsx` — **교사** 로그인(아이디·비밀번호)
- `src/components/StudentForm.jsx` — **학생** 로그인(학습 코드)

**교사 vs 학생 로그인 차이**

```jsx
// src/pages/Login.jsx
{
  target === 'teacher' && <LoginForm />;
} // 아이디 + 비밀번호
{
  target === 'student' && <StudentForm />;
} // 학습 코드 하나
```

- **학생 로그인**은 입력한 학습 코드를 `userId`와 `password`에 동일하게 넣어 로그인합니다(`signInMutation.mutate({ userId: data.code, password: data.code })`). 즉 학생은 코드 하나만 알면 됩니다.

**흐름 설명**

1. 앱 진입 시 `main.jsx`의 `loader()`가 `getUserData()`를 호출한다.
2. `getUserData()`는 `localStorage`의 `token`을 읽어 `GET /auth/check`로 검증한다. 실패 시 `null` 반환.
3. 최상위 `AuthLayout`이 `loader` 결과(`user`)를 `AuthProvider`에 주입한다.
4. `AuthProvider`는 `user`를 기반으로 초기화하며, 로그인/홈 페이지에 있으면 역할에 따라 리다이렉트한다.
   - `role === "student"` → `/learn/{characterId}`
   - 그 외(교사) → `/manage`
5. 로그인 폼은 `useMutation(userSignIn)` → 성공 시 `AuthContext`의 `login()` 호출 → 토큰·유저 저장 후 역할별 페이지로 이동.

> 💡 토큰은 `localStorage`에 `"token"` 키(JSON 문자열)로, 유저 정보는 `"user"` 키에 저장됩니다(`useLocalStorage` 훅). 라우트 가드를 별도 컴포넌트로 두지 않고 `AuthContext`의 `useEffect` 3개가 ① 서버 데이터 초기화, ② 로그인 사용자의 공개 페이지 접근 차단, ③ 토큰 만료 시 로그아웃을 담당합니다. `publicPaths`(`/`, `/login/*`, `/policy/privacy`)는 인증 없이 접근 가능합니다.
>
> ⚠️ 토큰 자동 refresh는 **미구현**입니다. 토큰 만료 시 재로그인이 필요합니다.

### 7-2. 라우트 구조

`main.jsx`의 `createRoutesFromElements` 기준:

| 경로                                        | 컴포넌트                        | 대상   |
| ------------------------------------------- | ------------------------------- | ------ |
| `/`                                         | `pages/dashboard` (Main)        | 공개   |
| `/login/teacher`, `/login/student`          | `pages/Login`                   | 미인증 |
| `/policy/privacy`                           | `pages/PrivacyPolicy`           | 공개   |
| `/manage`                                   | `DashboardLayout` + `Dashboard` | 교사   |
| `/manage/groups`, `/manage/groups/:groupId` | 그룹·캐릭터 관리                | 교사   |
| `/manage/groups/:groupId/:characterId`      | `CharacterCurriculumManagement` | 교사   |
| `/manage/students`                          | `StudentManagement`             | 교사   |
| `/learn`                                    | `LearnLayout` + `Character`     | 학생   |
| `/learn/:character`                         | `ProgressLayout` + `Target`     | 학생   |
| `/learn/:character/:chapter`                | `Method`                        | 학생   |
| `/learn/:character/:chapter/:method`        | `Learn`                         | 학생   |
| `/legacy`, `/legacy/students`               | 레거시 대시보드                 | (구)   |

### 7-3. 학생 학습 흐름 (핵심)

학생 학습은 **3단계 선택 → 실제 학습**으로 진행됩니다. URL 깊이가 곧 선택 단계입니다.

**관련 파일**

- `src/pages/Character.jsx` — ① 캐릭터(친구) 선택
- `src/pages/Target.jsx` — ② 무엇을 배울지(학습 대상) 선택
- `src/pages/Method.jsx` — ③ 어떻게 배울지(학습 방식) 선택
- `src/pages/Learn.jsx` — ④ 실제 학습 화면 (방식별 컴포넌트 분기)
- `src/layouts/ProgressLayout.jsx` — `SessionProvider`로 학습 세션 감싸기 + 이어하기 모달
- `src/context/SessionContext.jsx` — 학습 세션 상태·서버 동기화 (가장 중요)
- `src/utils/globals.js` — `TARGETS`/`METHODS`/`COLORS` 매핑, 한글 조사(`JOSA`) 유틸

**용어 매핑** (`globals.js` 기준)

| 구분              | 코드 키(`key`) → 표시명                                    |
| ----------------- | ---------------------------------------------------------- |
| 학습 대상(target) | `vowel`=모음, `consonant`=자음, `letter`=글자, `word`=낱말 |
| 학습 방식(method) | `read`=읽기, `listen`=듣기, `speak`=말하기, `write`=쓰기   |

**흐름 설명**

1. **`/learn` (`Character`)** — "나는 누구일까요?" 캐릭터(뚜디·루루·포니·밀리·네코·쿠쿠·핑핑·찌니·옥토 9종)를 고른다. 진입 시 `getDefaultProgress()`로 이어할 캐릭터가 있으면 `/learn/{character}`로 자동 이동.
2. **`/learn/:character` (`Target`)** — "무엇을 배울까요?" `useCurriculumQuery`로 받은 커리큘럼(`curriculumData`)에서 학습 대상(모음/자음/글자/낱말)을 고른다. 선택 시 `/learn/{character}/{chapterId}?target={name}`로 이동.
3. **`/learn/:character/:chapter` (`Method`)** — "어떻게 배울까요?" 해당 챕터의 학습 방식(읽기/듣기/말하기/쓰기)을 고른다. 이미 끝난(`session.status === "ended"`) 방식은 비활성화. 선택 시 `/learn/{character}/{chapter}/{method}`로 이동.
4. **`/learn/:character/:chapter/:method` (`Learn`)** — `SessionContext`가 콘텐츠를 로드하고, `method` 값에 따라 `LearnByRead`/`LearnByListen`/`LearnBySpeak`/`LearnByWrite` 중 하나를 렌더링한다.

> 💡 `ProgressLayout`이 `/learn/:character` 하위 전체를 `SessionProvider`로 감싸므로, Target·Method·Learn은 같은 세션 컨텍스트를 공유합니다. 이어하기 모달(`ResumeLearningModal`)도 이 레이아웃에서 단계별로 자동 노출됩니다.

### 7-4. 학습 세션 동작 (`SessionContext`)

학습의 상태 머신에 해당하는 부분으로, **서버가 진행 포인터의 source of truth(원본·기준)**입니다.

**흐름 설명**

1. `Learn` 진입 시 `useContentQuery(character, chapter, method)`로 콘텐츠를 불러온다. (`data.contents` 배열, `data.repeat` 반복 횟수, `data.target`)
2. 세션 초기화: `getActiveSession()`으로 진행 중 세션을 찾고, 있으면 인덱스/반복 횟수를 복원, 없으면 `startSession()`으로 새로 시작한다. 이때 `device` 정보(브라우저·화면)와 `ipapi.co`로 조회한 IP/지역을 함께 전송한다.
3. 각 콘텐츠는 `repeatSettings.correct`회 반복 학습하며, 오답 시 `incorrect`(= `correct × 1.5`, 올림)가 적용된다.
4. 학생이 답하면 `onAnswer(attempt)` → `postAttempt()`로 답안과 집중도 데이터를 서버에 보낸다. **서버 응답의 `session`이 다음 `currentItemIndex`/`currentQuestionNo`/`currentLearningCount`를 결정**한다(클라이언트가 직접 증가시키지 않음).
5. 정답/오답에 따라 토스트(`sonner`)와 효과음(`/sounds/correct.mp3`·`wrong.mp3`·`completed.mp3`, `LearnLayout`의 `<audio>` 요소)을 재생한다.
6. 한 학습이 끝나면(`session.status === "ended"`) `getNextStep()`이 `useCurriculumListQuery`의 순서를 보고 다음 커리큘럼 항목으로 자동 이동시킨다. 남은 항목이 없으면 "모든 학습을 완료했습니다" 안내.

> 💡 콘텐츠 리스트 점프, 새로고침/뒤로가기 후 포인터 보정 등 "응답 없는 이동"은 `postAttempt`가 아니라 `saveProgressOnly()`(→ `patchProgress`)로 처리해 Attempt 기록을 남기지 않습니다. 진행 포인터를 클라이언트에서 임의로 바꾸지 말고 항상 서버 응답으로 갱신하는 구조임에 주의하세요.

### 7-5. 학습 방식 4종 (`LearnBy*`)

`Learn.jsx`가 `method`로 분기하며, 모든 컴포넌트는 공통으로 `onAnswer(userAnswer, correctAnswer)`를 호출합니다.

| 방식           | 컴포넌트        | 판정 방식                                                                                                                                                                                                                                |
| -------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 읽기 `read`    | `LearnByRead`   | 보기 3개 중 정답 글자 고르기. `data`에서 오답 후보를 무작위로 뽑아 섞음(`Options`).                                                                                                                                                      |
| 듣기 `listen`  | `LearnByListen` | 소리를 듣고 맞는 보기 고르기.                                                                                                                                                                                                            |
| 말하기 `speak` | `LearnBySpeak`  | **Web Speech API**(`window.SpeechRecognition`, `ko-KR`)로 발음을 인식해 정답과 비교. 예시 발음은 `getAsset({type:"sound"})` TTS 재생. **HTTPS(secure context) 필수.**                                                                    |
| 쓰기 `write`   | `LearnByWrite`  | 캔버스 손글씨를 판별. **자음·모음**(`vowel`/`consonant`)은 로컬 **Teachable Machine 모델**(`/tm-vowel`·`/tm-cons`, TensorFlow.js)로 Top-3 예측, **글자·낱말**(`letter`/`word`)은 **서버 OCR**(`fetchWriteOCR` → `VITE_VAPI_URL`)로 판별. |

> 💡 `write`에서 자모와 글자/낱말의 판별 경로가 다릅니다(`USE_TF_FOR = {vowel, consonant}`). 자모는 클라이언트 모델이라 `/tm-*/model.json`·`metadata.json`이 `public/`에 있어야 하고(없으면 "모델을 불러오지 못했습니다"), 글자/낱말은 서버 OCR이라 `VITE_VAPI_URL`이 비어 있으면 채점이 실패합니다. `speak`/`write`의 정답 판정은 후보 배열에 정답이 포함되는지(`includes`)로 처리됩니다(완전 일치가 아님).

### 7-6. 집중도 모니터링

학습 중 카메라·응답 패턴을 분석해 실시간 집중도를 산출하고, attempt에 함께 저장합니다.

**관련 파일**

- `src/hook/useIntegratedConcentrationMonitor.jsx` — 카메라·음성·응답 데이터 통합 점수 계산
- `src/hook/useConcentrationMonitor.jsx` — 얼굴/시선 감지(카메라, `videoRef`)·응답 시간·비활성 추적
- `src/hook/useSpeechRecognitionMonitor.jsx` — 말하기 활동의 발화 패턴 추적
- `src/features/ConcentrationAlert.jsx` — 실시간 경고 표시

**흐름 설명**

1. `Learn.jsx`가 숨겨진 `<video ref={videoRef}>`를 두고 `useIntegratedConcentrationMonitor(sessionId, studentId, method)`를 초기화한다.
2. 문제가 바뀔 때 `startQuestion()`, 답을 낼 때 `submitAnswer()`가 호출되어 응답 시간·정답 여부·시선/얼굴 감지 결과를 모은다.
3. 너무 빠른/느린 응답, 연속 오답, 비활성 시간, 시선 이탈, 얼굴 미감지 등을 점수화해 `concentrationLevel`(`high`/`medium`/`low`)과 `sessionQuality`(0~100)를 만든다.
4. 산출된 집중도(`concentration`)는 `handleAnswer`에서 attempt에 포함되어 `postAttempt`로 백엔드에 전송된다.

> 💡 `Learn.jsx`의 `studentId`는 `"student_1"`로 하드코딩되어 있으나, 현재 서버 전송·저장 데이터 어디에도 포함되지 않아 실제 동작에는 영향이 없습니다(집중도 모니터링 훅 내부까지만 전달되고 쓰이지 않음). 향후 집중도를 학생별로 저장·구분하는 기능을 추가할 때 실제 사용자 ID로 교체가 필요합니다. (12장 참고)

### 7-7. 교사 대시보드 (`/manage`)

선생님이 학생·그룹·커리큘럼을 관리하고 학습 현황을 보는 영역입니다. `DashboardLayout`(사이드바·헤더) 안에서 동작합니다.

**관련 파일**

- `src/components/dashboard/Dashboard.jsx` — 메인 대시보드(핵심 지표·그래프)
- `src/components/dashboard/GroupManagement.jsx` — 그룹 목록·생성·삭제
- `src/components/dashboard/CharacterManagement.jsx` — 그룹 내 학생(캐릭터) 관리
- `src/components/dashboard/CharacterCurriculumManagement.jsx` — 학생별 커리큘럼 구성
- `src/components/dashboard/CurriculumEditorWithLibrary.jsx` — 커리큘럼 편집기
- `src/components/dashboard/StudentManagement.jsx` — 전체 학생 학습 현황
- `src/components/dashboard/IEPReport.jsx` / `IEPReportHeader.jsx` — 개별화 학습 보고서
- `src/hook/useStudentAnalytics.jsx` — 대시보드·리포트용 분석 데이터 조회

**주요 기능**

1. **메인 대시보드(`Dashboard`)** — `useLearningOverview(user._id)`로 받은 데이터로 핵심 지표 카드(활동 학생·응시 문제·평균 정답률·총 학습 시간)와 그래프(학습 방식별/콘텐츠별 정답률 레이더 차트, 최근 7일 활동, 난이도별 성과 산점도)를 `recharts`로 렌더링한다.
2. **그룹·학생 관리** — 그룹(`GroupManagement`) → 그룹 내 학생(`CharacterManagement`) → 학생별 커리큘럼(`CharacterCurriculumManagement`)으로 내려가는 계층 구조. 커리큘럼 순서 조정에 `@hello-pangea/dnd`(드래그앤드롭)와 `src/utils/reorder.js`를 사용한다.
3. **IEP 리포트(`IEPReport`)** — 학생 한 명의 최근 30일 학습 분석을 `useStudentAnalytics(characterId, dateRange)`로 받아 성취 수준(우수/양호/보통 등)으로 정리해 보여준다.

> 💡 대시보드 지표는 모두 백엔드 분석 API(`useStudentAnalytics`/`useLearningOverview`) 응답에 의존하므로, 화면에 숫자가 0이거나 비어 보이면 프론트가 아니라 **서버 데이터·집계 쪽을 먼저 확인**하세요. `mock-learning-stats.js`는 개발용 더미 데이터입니다(운영 데이터 아님).

---

## 8. API 연동 방식

이 프로젝트는 axios가 아니라 **`fetch` 기반 래퍼**(`src/api/index.js`)를 사용합니다. 인터셉터(요청을 가로채 공통 처리하는 장치)가 없으므로, 인증이 필요한 요청은 호출부에서 헤더를 직접 전달해야 합니다.

```js
// src/api/index.js — 베이스 URL은 환경변수 함수로 평가
export const API_URL = () => import.meta.env.VITE_API_URL;

// 토큰 검증은 Authorization 헤더를 직접 구성
async function auth({ token }) {
  const res = await fetch(`${API_URL()}/auth/check`, {
    headers: { Authorization: `Bearer ${token}` /* ... */ },
  });
  return res.json();
}
```

- `get/post/put/patch/del` 함수 시그니처는 `(route, data, headers)` 형태이며, `headers` 인자로 `Authorization`을 넘긴다.
- `post`는 HTTP 에러 시 `throw`하지만, `get/put/patch/del`은 `catch`에서 `{ result: false, error }`를 반환하는 차이가 있다(에러 처리 방식 불일치 주의).
- 세션 관련 호출(`src/api/session.js`)은 래퍼를 거치지 않고 `fetch`를 직접 사용한다.

### 백엔드 API 서버 주소

| 환경 | URL                             |
| ---- | ------------------------------- |
| 로컬 | `http://localhost:59421/v1`     |
| 운영 | `https://hani-api.circul.us/v1` |

> 실제 값은 `.env.ops.local` / `.env.prod`의 `VITE_API_URL`에 설정됩니다.

### 공통 응답 포맷

```json
// 성공
{ "result": true, "data": { ... } }
// 실패
{ "result": false, "error": "에러 메시지" }
```

---

## 9. 환경변수

Vite는 `VITE_` 접두사가 있는 변수만 클라이언트(`import.meta.env`)에서 접근할 수 있습니다.
환경별 파일(`.env.ops.local`, `.env.prod`)로 분리되어 있으며, 빌드 모드(`--mode ops` / `--mode prod`)에 따라 선택됩니다.

아래는 `.env.prod`(배포 빌드 `--mode prod`)에 설정된 값입니다.

```env
VITE_APP_ENV=OPS                                      # 앱 환경 구분 값
VITE_API_URL=https://hani-api.circul.us/v1            # 또박한글 API 서버 베이스 URL (/v1 포함)
VITE_VAPI_URL=https://o-vapi.circul.us/code/ocr?lang=ko  # 음성/손글씨 판별(OCR) API URL
VITE_FILE_URL=https://hani-api.circul.us/v1           # 정적 자산(이미지 등) 파일 서버 URL — getAsset()에서 사용
```

> 로컬 개발(`--mode ops`)은 `.env.ops.local`을 사용하며, 보통 `VITE_API_URL`을 로컬 백엔드(`http://localhost:59421/v1`)로 둡니다(6장 "백엔드 연결" 참고).

---

## 10. 빌드 및 배포

```bash
npm run build    # vite build --mode prod → dist/ 생성
npm run preview  # 빌드 결과 로컬 미리보기
npm run lint     # eslint .
```

- 개발: `--mode ops` (`.env.ops.local` 사용)
- 빌드: `--mode prod` (`.env.prod` 사용)
- PWA: `registerType: "autoUpdate"`로 서비스워커가 자동 갱신됩니다. 정적 자산 캐시 갱신에 주의하세요. TensorFlow.js 모델 등 대용량 파일을 위해 workbox `maximumFileSizeToCacheInBytes`가 5MB로 설정되어 있습니다.

### 코드 스타일

- **Prettier**: 포맷 규칙은 `.prettierrc`에 정의되어 있습니다(작은따옴표, 세미콜론, 들여쓰기 2칸, `trailingComma: all`, `printWidth: 80`, Tailwind 클래스 정렬 플러그인). 별도 npm 스크립트는 없으므로, 에디터의 "저장 시 포맷"을 켜거나 `npx prettier --write .`로 적용하세요. 포맷이 안 맞으면 커밋 diff가 불필요하게 커집니다.
- **ESLint**: `npm run lint`로 검사합니다.
- 브랜치/커밋/PR 컨벤션은 팀 규칙을 따르세요. *(팀에서 정한 규칙이 있으면 여기에 채워주세요.)*

### 배포

프론트엔드 프로젝트들은 공통 배포 스크립트 `~/Documents/DEV/pub-front.sh`로 배포합니다(빌드 → 압축 → 서버 전송 → 원격 배포). SSH 키 `circulus.pem`이 필요합니다.

```bash
~/Documents/DEV/pub-front.sh circulus-hani OPS   # 운영 배포
~/Documents/DEV/pub-front.sh circulus-hani STG   # 스테이징 배포
```

- 스크립트가 내부에서 `npm run build`로 `dist/`를 만든 뒤, 대상 서버(OPS / STG)로 전송해 원격 배포를 실행합니다.
- 세 번째 인자로 배포 날짜(`YYYYMMDDHHMM`)를 줄 수 있으며, 생략하면 현재 시각이 사용됩니다.
- 실행 전 스크립트 내용과 대상 환경을 확인하세요.

---

## 11. 트러블슈팅

### Q. 환경변수가 `undefined`로 나와요.

> Vite 환경변수는 `VITE_` 접두사가 필요합니다. 또한 `import.meta.env.VITE_API_URL`은 빌드 모드(`--mode ops` / `--mode prod`)에 맞는 `.env.*` 파일에서 주입됩니다. 모드를 잘못 지정하면 값이 비어 있을 수 있습니다.

### Q. 음성 인식 / 카메라 기능이 동작하지 않아요.

> 음성·카메라는 보안 컨텍스트(secure context)에서만 동작합니다. **`http://localhost:5173`으로 접속하면 됩니다** — `localhost`는 HTTP여도 secure context로 인정되므로 별도 설정이 필요 없습니다. 단, `http://192.168.x.x`(LAN IP)로 접속하면 secure context가 아니라 막힙니다. 실기기를 LAN IP로 테스트해야 한다면 HTTPS가 필요하며, 구성 방법은 6장 "HTTPS는 언제 필요한가"를 참고하세요.

### Q. 쓰기(손글씨) 채점이 안 돼요.

> 자음·모음은 브라우저 내 모델(`public/tm-vowel`·`tm-cons`)로, 글자·낱말은 서버 OCR(`VITE_VAPI_URL`)로 채점합니다. 자모가 안 되면 모델 파일 존재 여부를, 글자/낱말이 안 되면 `VITE_VAPI_URL` 설정을 확인하세요. (7-5 참고)

### Q. 코드를 수정했는데 브라우저에 반영되지 않아요 (PWA 캐시).

> `registerType: "autoUpdate"`로 서비스워커가 이전 자산을 캐시할 수 있습니다. 개발자 도구 → Application → Service Workers에서 unregister 후 강력 새로고침(hard reload)하세요.

> **(개발 중 겪은 문제를 직접 추가하세요)** — 실제로 막혔다가 해결한 경험을 `Q. 문제 → 해결` 형식으로, 에러 메시지 원문과 함께 기록하면 다음 사람에게 가장 큰 도움이 됩니다.

---

## 12. 알려진 이슈 / 기술부채

작업 전에 알아두면 좋은 지점들을 모았습니다. 본문 곳곳에서 언급된 주의사항을 여기에서 한 번에 확인할 수 있습니다.

- **`studentId` 하드코딩 (현재는 미사용)** — `src/pages/Learn.jsx`의 `studentId`가 `"student_1"`로 고정되어 있습니다. 다만 이 값은 현재 서버로 전송되는 attempt에도, 저장되는 데이터에도 포함되지 않아 **실제 동작에는 영향이 없습니다**(집중도 모니터링 훅 내부까지만 전달되고 실제로 쓰이지 않음). 향후 집중도를 학생별로 저장·구분하는 기능을 추가할 때 실제 사용자 ID로 교체가 필요합니다. (7-6 참고)
- **토큰 자동 refresh 미구현** — 토큰 만료 시 재로그인이 필요합니다. 갱신 로직은 주석으로만 존재합니다. (7-1 참고)
- **API 래퍼의 에러 처리 불일치** — `src/api/index.js`에서 `post`는 HTTP 에러 시 `throw`하지만, `get/put/patch/del`은 `catch`에서 `{ result: false, error }`를 반환합니다. 호출부에서 에러 처리 방식이 달라질 수 있으니 주의하세요. (8장 참고)
- **`session.js`는 공통 래퍼를 우회** — `src/api/session.js`는 `get/post` 래퍼를 거치지 않고 `fetch`를 직접 사용합니다. 인증 헤더 등 공통 처리가 자동 적용되지 않으니 수정 시 유의하세요. (8장 참고)
- **미사용(레거시) 추정 파일** — `src/features/`의 `VowelView`·`ConsonantView`·`SyllableView`·`WordView`, `src/data/`의 JSON 데이터, 빈 `src/routes/` 폴더는 현재 코드에서 참조되지 않습니다. 정리 시 실제 사용 여부 확인이 필요합니다. (7-0 참고)
- **자동화 테스트 없음** — 현재 테스트 코드가 없어 변경 검증은 수동으로 합니다.
