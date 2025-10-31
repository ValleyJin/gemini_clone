# 코드 블록(백틱) 처리 전략 정리

이 문서는 Gemini 응답의 마크다운 코드(백틱)를 채팅 UI에서 안정적으로 표시하기 위해 적용한 처리 과정을 정리합니다.

## 목표
- 트리플 백틱( ``` … ``` ) 코드블록은 `<pre><code>...</code></pre>`로 표시
- 싱글 백틱(`code`)은 `<code>code</code>`로 표시
- 코드 안의 `<`, `>`, `&` 등은 반드시 HTML 이스케이프
- 코드 이외의 텍스트(헤딩/리스트/강조/구분선/개행)는 일반 변환 규칙 적용

## 처리 순서(핵심)
1) 코드블록을 먼저 보호(플레이스홀더 치환)
2) 일반 마크다운(강조/헤딩/목록/구분선/개행) 변환
3) 싱글 백틱 인라인코드 변환
4) 플레이스홀더를 실제 `<pre><code>`로 복원

> 코드블록을 최우선으로 보존하는 이유: 아래 단계의 다른 정규식 변환이 코드 내용에 영향을 주는 것을 방지하기 위함

## 구현 코드 (script.js 발췌)
```javascript
// 0) 원문
const originalText = data.candidates[0].content.parts[0].text;

// 1) 코드블록 보존 (```lang\n … ```)
const codeBlocks = [];
let tmpText = originalText.replace(/```(?:([a-zA-Z0-9_-]+)\n)?([\s\S]*?)```/g, (_, lang, code) => {
  const escaped = (code || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const language = (lang || "javascript").toLowerCase();
  const token = `__CODE_BLOCK_${codeBlocks.length}__`;
  // 라인넘버 제거, Prism 규격 class 적용
  codeBlocks.push(`<pre><code class="language-${language}">${escaped}</code></pre>`);
  return token;
});

// 2) 일반 마크다운 변환(강조/헤딩/목록/구분선/개행)
tmpText = tmpText
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/\*([^*]+)\*/g, "<em>$1</em>")
  .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
  .replace(/^### (.+)$/gm, "<h3>$1</h3>")
  .replace(/^## (.+)$/gm, "<h2>$1</h2>")
  .replace(/^# (.+)$/gm, "<h1>$1</h1>")
  .replace(/^[\s]*[-*]\s+(.+)$/gm, '<div class="list-item">• $1</div>')
  .replace(/^[\s]*(\d+)[\.\)]\s+(.+)$/gm, '<div class="numbered-item"><span class="number">$1.</span><span class="content">$2</span></div>')
  .replace(/^[\s]*---+[\s]*$/gm, "<hr>")
  .replace(/\r\n|\r|\n\n/g, "<br><br>")
  .replace(/\n/g, "<br>")
  .trim();

// 3) 인라인 코드(`code`) 변환
tmpText = tmpText.replace(/`([^`]+)`/g, (_, code) => {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<code>${escaped}</code>`;
});

// 4) 코드블록 복원
codeBlocks.forEach((html, i) => {
  tmpText = tmpText.replace(`__CODE_BLOCK_${i}__`, html);
});

const responseText = tmpText;
// 코드가 포함된 경우 즉시 렌더링 후 Prism 하이라이트 실행
if (/<pre|<code/.test(responseText)) {
  textElement.innerHTML = responseText;
  botMsgDiv.classList.remove("loading");
  if (window.Prism && typeof window.Prism.highlightAllUnder === "function") {
    window.Prism.highlightAllUnder(botMsgDiv);
  }
} else {
  typingEffect(responseText, textElement, botMsgDiv);
}
```

## CSS 권장 스타일(선택)
```css
.chats-container .message .message-text pre {
  background: #0d1117; /* 딥 다크 톤 */
  padding: 10px 12px;
  border-radius: 8px;
  overflow-x: auto;
  line-height: 1.5;
  margin: 8px 0;
  border: 1px solid #21262d;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
}
.chats-container .message .message-text pre code { background: transparent; padding: 0; }
.chats-container .message .message-text :not(pre) > code { background: #0d1117; padding: 2px 6px; border-radius: 4px; }
```

## 체크리스트
- [x] 코드블록을 가장 먼저 플레이스홀더로 보존했는가?
- [x] 코드 내부 문자는 HTML 이스케이프 했는가?
- [x] 일반 텍스트에 대한 마크다운 변환 후 인라인 코드 처리했는가?
- [x] 마지막에 코드블록 플레이스홀더를 복원했는가?

## 참고
- 정규식 플래그 `g`(전역), `m`(멀티라인)를 적절히 사용해 줄 단위 변환을 안정적으로 처리합니다.

## 정규식 플래그 `g`와 `m` 상세 설명

### 정규식 플래그란?
정규식 패턴 뒤에 붙이는 **옵션 문자**로, 매칭 방식을 제어합니다.

### `g` 플래그 (Global - 전역)
**"문자열 전체에서 모든 매칭을 찾아라"**

```javascript
// g 플래그 없음 (기본값)
"hello hello hello".replace(/hello/, "hi")
// 결과: "hi hello hello" (첫 번째만 교체)

// g 플래그 있음
"hello hello hello".replace(/hello/g, "hi") 
// 결과:s "hi hi hi" (모든 매칭 교체)
```

### `m` 플래그 (Multiline - 멀티라인)
**"각 줄의 시작(^)과 끝($)을 인식해라"**

```javascript
const text = `첫 번째 줄
두 번째 줄
세 번째 줄`;

// m 플래그 없음
text.replace(/^줄/g, "라인")
// 결과: "첫 번째 라인\n두 번째 줄\n세 번째 줄" (첫 줄만 '라인'이 들어감)

// m 플래그 있음  
text.replace(/^줄/gm, "라인")
// 결과: "첫 번째 라인\n두 번째 라인\n세 번째 라인" (모든 줄에 '라인'이 들어감)
```

### 우리 코드에서의 활용
```javascript
// 헤딩 변환 예시
.replace(/^#### (.+)$/gm, "<h4>$1</h4>")
//     ↑     ↑     ↑
//     ^     $     gm
//   줄시작 줄끝  전역+멀티라인
```

**동작 과정:**
1. `^` → 각 줄의 시작에서
2. `#### ` → "#### " 패턴 찾기
3. `(.+)` → 그 뒤의 모든 문자 캡처
4. `$` → 줄의 끝까지
5. `g` → 모든 줄에서 반복
6. `m` → 각 줄을 개별적으로 처리

### 실제 예시
```javascript
const markdown = `#### 제목1
일반 텍스트
#### 제목2
또 다른 텍스트`;

// g, m 플래그 사용
markdown.replace(/^#### (.+)$/gm, "<h4>$1</h4>")

// 결과:
// <h4>제목1</h4>
// 일반 텍스트  
// <h4>제목2</h4>
// 또 다른 텍스트
```

### 플래그 조합의 중요성
- **`g`만 사용**: 첫 번째 줄만 처리
- **`m`만 사용**: 각 줄의 첫 번째 매칭만 처리  
- **`gm` 함께 사용**: 모든 줄의 모든 매칭 처리 ✅

**결론:** `gm` 플래그로 **줄 단위 변환을 안정적으로 처리**할 수 있습니다!

