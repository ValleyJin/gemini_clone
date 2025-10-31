https://youtu.be/rgD6MHCjZdA?si=_12Bvpbq24qD_KF1

# script.js 실행 흐름 분석

## 실행 흐름 분석

### 실제 실행되는 라인 순서

```javascript
// ========== 1단계: 즉시 실행 (페이지 로드 시) ==========
// 1-20번 줄: 변수 선언 및 초기화 (즉시 실행)
const container = document.querySelector(".container")           // 1줄
const chatsContainer = document.querySelector(".chats-container") // 4줄
const promptForm = document.querySelector(".prompt-form");        // 6줄
const promptInput = promptForm.querySelector(".prompt-input");    // 9줄
const API_KEY = "...";                                            // 15줄
const API_URL = `...`;                                            // 16줄
let userMessage = "";                                             // 19줄
const chatHistory = [];                                           // 20줄

// 22-67번 줄: 함수 정의 (실행 안됨, 나중을 위해 저장만)
const createMsgElement = ...   // 24줄
const scrollToBottom = ...     // 36줄
const typingEffect = ...       // 45줄
const generateResponse = ...   // 70줄
const handleFormsubmit = ...   // 213줄

// 257번 줄: 이벤트 리스너 등록 (즉시 실행)
promptForm.addEventListener("submit", handleFormsubmit);  // 257줄

// ========== 2단계: 사용자가 입력하고 제출 버튼 클릭 시 ==========
// 213번 줄부터 실행 시작
handleFormsubmit 함수 실행
  → 251번 줄: generateResponse(botMsgDiv) 호출
    → 70번 줄: generateResponse 함수 실행
      → 196번 줄: typingEffect(...) 호출
        → 45번 줄: typingEffect 함수 실행
```

---

## 페이지 로드 시 즉시 실행되는 라인

```javascript
라인 1-20:   변수 선언 및 DOM 요소 선택 (즉시 실행)
라인 257:    이벤트 리스너 등록 (즉시 실행)
```

**실제로 페이지가 로드되면 1-20번, 257번만 실행됩니다!**

---

## 사용자 액션 후 실행되는 라인

```
사용자가 메시지 입력 후 제출 버튼 클릭
  ↓
257번: addEventListener가 감지
  ↓
213번: handleFormsubmit 실행 시작
  ↓
247번: botMsgDiv 생성 (createMsgElement 호출 → 24번)
  ↓
251번: generateResponse(botMsgDiv) 호출
  ↓
70번: generateResponse 실행
  ↓
93번: fetch로 API 호출
  ↓
196번: typingEffect 호출 또는 184번: 즉시 렌더링
  ↓
45번: typingEffect 실행 (타이핑 애니메이션)
```

---

## 가독성 개선 제안

코드를 다음과 같이 재구성하면 훨씬 보기 좋습니다:

```javascript
// ==========================================
// 1. 전역 변수 및 상수 선언
// ==========================================
const container = document.querySelector(".container")
const chatsContainer = document.querySelector(".chats-container")
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

const API_KEY = "AIzaSyDH8QEHnbmcol0Om22D1M90iZMGHcPzflo";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
const chatHistory = [];

// ==========================================
// 2. 유틸리티 함수들
// ==========================================
const createMsgElement = (html, ...classes) => { ... }
const scrollToBottom = () => { ... }
const typingEffect = (html, textElement, botMsgDiv) => { ... }

// ==========================================
// 3. 핵심 비즈니스 로직
// ==========================================
const generateResponse = async (botMsgDiv) => { ... }
const handleFormsubmit = (e) => { ... }

// ==========================================
// 4. 이벤트 리스너 등록 (초기화)
// ==========================================
promptForm.addEventListener("submit", handleFormsubmit);
```

---

## 핵심 정리

| 라인 범위 | 역할 | 실행 시점 |
|----------|------|----------|
| **1-20** | 변수/상수 선언 | ✅ 페이지 로드 시 즉시 |
| **24-67** | 함수 정의 | ❌ 실행 안됨 (정의만) |
| **70-210** | 함수 정의 | ❌ 실행 안됨 (정의만) |
| **213-253** | 함수 정의 | ❌ 실행 안됨 (정의만) |
| **257** | 이벤트 등록 | ✅ 페이지 로드 시 즉시 |
| **213-253** | 메인 실행 | ✅ 사용자가 제출 버튼 클릭 시 |

**실행 시작점**: 
- 페이지 로드 시: **1번 줄** (변수 선언)
- 사용자 액션 시: **213번 줄** (handleFormsubmit 함수)
