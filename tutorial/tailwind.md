# Tailwind CSS와 특이성 관리

## 1. Tailwind의 특이성 전략

Tailwind는 **특이성(speciﬁcity)을 낮게 유지**하고, **레이어와 순서로
우선순위를 결정**하는 방식으로 동작합니다.\
클래스가 여러 개 나열되어도 특이성이 폭주하지 않습니다.

-   대부분의 유틸리티는 단일 클래스 선택자: `.bg-red-500 { … }` → 특이성
    0-0-1
-   변형(`hover:`, `focus:`)은 의사클래스를 추가 → 특이성 0-0-2 수준
-   반응형 변형(`md:`)은 미디어쿼리만 추가 → 특이성 변동 없음
-   다크모드(`.dark .bg-slate-900`)도 특이성 0-0-2

따라서 한 요소에 20개의 클래스를 나열해도, **각 규칙은 서로 독립적인
0-0-1(또는 0-0-2)**로 계산됩니다.
- html파일에서 class에 병렬로 여러 개를 나열하더라도,
- css파일에서는 단독으로 1개의 클래스 각각에 대해서만 별도로 정의하기 때문 (만약, css 파일에서 여러 개를 공백으로 연결하여 병렬로 기입하면 부모, 자식 관계로 해석되며 점수는 합산됨)
- 특이성 점수는 css파일에 적용되는 것이므로, html 파일에 병렬로 기입된 것은 영향을 미치지 않음
- 이로 인해 html 파일에서 class가 더해질 수록 화면에는 덧칠되는 형태로 합성됨

### 유틸리티 다중 적용 시 동작 원리(보완/덮어쓰기)

Tailwind CSS를 `div`의 `class` 속성에 여러 개 적으면, 뒤에 오는 클래스가 앞의 디자인을 보완하거나(속성이 다를 때), 같은 속성일 경우 마지막 규칙이 값을 덮어씁니다. 이는 CSS의 캐스케이드와 특이성 원리에 따른 기본 동작입니다.

- 대부분의 유틸리티는 단일 속성 매핑: 0-0-1(단일 클래스) 특이성
- 동일 특이성 충돌 시: “나중에 선언된 규칙”이 승자
- Tailwind는 유틸리티를 알파벳 순 등 일관된 순서로 출력하여 예측가능성 확보

예시(보완 관계):

```html
<div class="text-xl font-bold text-blue-500">Hello, Tailwind!</div>
```

적용 결과:

```css
/* 서로 다른 속성이라 충돌 없음 */
font-size: 1.25rem; line-height: 1.75rem; /* text-xl */
font-weight: 700;                         /* font-bold */
color: #3b82f6;                           /* text-blue-500 */
```

예시(덮어쓰기 관계):

```html
<div class="bg-red-500 bg-blue-500">Background Test</div>
```

설명:

```css
/* 같은 속성(background-color)을 설정 → 뒤 규칙이 승자 */
background-color: #ef4444; /* bg-red-500, 먼저 선언됨 */
background-color: #3b82f6; /* bg-blue-500, 나중 선언 → 최종 적용 */
```

따라서 동일 속성을 다루는 유틸리티를 함께 쓰면 마지막 클래스가 최종 값을 결정합니다.

## @ --> at rule 

- 표준 CSS에서 @ 접두사가 붙은 것들은 "At-Rule"이라고 부릅니다. 예를 들어 @import, @media, @keyframes, @font-face 등이 있습니다. 
- 이들은 CSS 문서를 구성하거나 특정 조건에서 스타일을 적용하는 등 특별한 기능을 수행합니다.
- 이러한 At-Rule들은 W3C에서 정한 CSS 표준에 따라 정의되어 있습니다.

## @tailwind

- **역할**
  - Tailwind CSS 빌드 과정(PostCSS를 통해)에서 실제 CSS 코드를 삽입하라는 지시어 역할을 하는 커스텀 At-Rule입니다. 
  - input.css 파일에 작성되지만, 빌드를 거치면서 완전히 실제 CSS 코드로 대체되어 output.css 파일이 생성됩니다.

- **@tailwind 지시어의 역할**
  - `@tailwind base;` `@tailwind components;` `@tailwind utilities;`는 메인 CSS(예: input.css)에 작성하는 지시어입니다.
  - 브라우저가 직접 해석하지 않고, Tailwind 빌드(PostCSS 플러그인)가 발견한 위치에 대량의 CSS를 "삽입(inject)"합니다.
  - `@tailwind base;` → Normalize/reset + 기본 요소(h1, p, a 등)
  - `@tailwind components;` → `@apply` 기반 컴포넌트/플러그인 컴포넌트
  - `@tailwind utilities;` → `flex`, `text-blue-500`, `p-4` 등 유틸리티 클래스

- **PostCSS와의 관계**
  - Tailwind CSS는 PostCSS 플러그인입니다.
  - PostCSS가 `@tailwind` 같은 "커스텀 at-rule"을 파싱하고, 최종 CSS를 생성합니다.
  - 브라우저는 `@tailwind`를 알지 못하며, 빌드된 최종 CSS만 읽습니다.


## @layer는 무엇인가? (CSS Cascade Layers)

- `@layer`는 Tailwind 전용 문법이 아니라, 표준 CSS의 "Cascade Layers(계층)"를 정의하는 at-rule입니다.
- 같은 특이성이라면, 나중에 선언된 레이어가 앞 레이어를 이깁니다.
- Tailwind는 이 표준 `@layer` 위에서 `base → components → utilities` 순으로 규칙을 배치합니다. 그래서 동일 특이성 충돌 시 utilities가 최종 승자입니다.

예시:

```css
@layer base {
  h1 { color: black; }
}

@layer components {
  .btn { color: gray; }
}

@layer utilities {
  .text-blue-600 { color: #2563eb; }
}
```

설명:
- 세 레이어 모두 특이성이 낮은 단일 선택자이므로, "선언 순서"가 우선합니다.
- Tailwind는 빌드시 utilities를 가장 뒤에 두므로, 동일 특이성일 때 utilities 규칙이 components/base를 덮어씁니다.
- 사용자 정의 CSS도 `@layer base|components|utilities` 중 어디에 두느냐로 우선순위를 조절할 수 있습니다.

브라우저 지원:
- 최신 브라우저가 CSS Cascade Layers를 지원합니다. (구형 환경에서는 빌드 단계에서 Tailwind가 생성한 순서가 사실상 같은 역할을 합니다.)

## PostCSS로 커스텀 At-Rule 만들기(고급)

Tailwind의 `@tailwind`처럼, PostCSS 플러그인을 사용하면 사용자 정의 At-Rule을 만들고 빌드 시 실제 CSS로 치환할 수 있습니다.

- ** 목표 : **

  - @my-custom-rule { color: red; } 와 같은 코드를 @my-custom-rule이 제거되고 p { color: red; } 가 삽입되도록 처리합니다.
  - 준비물:
    1.
    Node.js (LTS 버전 권장)

    2.
    npm 또는 Yarn

### 1) 준비

```bash
npm i -D postcss postcss-cli
```

선택: Tailwind와 함께 쓰는 경우에도 동일하게 동작합니다. Tailwind 플러그인보다 앞/뒤 어느 시점에 실행할지는 `postcss.config.js`에서 순서로 제어합니다.

### 2) 플러그인 작성

`plugins/myAtRule.js`

```js
// 간단한 커스텀 At-Rule: @my-utilities 를 실제 유틸리티 규칙으로 치환
const postcss = require('postcss');

module.exports = () => {
  return {
    postcssPlugin: 'postcss-my-at-rule',
    Once(root) {
      // @my-utilities 블록 전체를 찾아서 원하는 CSS로 대체
      root.walkAtRules('my-utilities', (atRule) => {
        // 블록 내부 내용을 파싱해서 사용할 수도 있고, 고정 규칙을 삽입할 수도 있음
        // 예시: .text-brand, .bg-brand 유틸리티 주입
        const replacement = `
          .text-brand { color: #7c3aed; }
          .bg-brand { background-color: #7c3aed; }
        `;
        atRule.replaceWith(postcss.parse(replacement));
      });

      // 파라미터를 받는 형태: @my-color purple;
      root.walkAtRules('my-color', (atRule) => {
        const color = (atRule.params || '').trim() || '#7c3aed';
        const css = `.text-custom { color: ${color}; }`;
        atRule.replaceWith(postcss.parse(css));
      });
    },
  };
};
module.exports.postcss = true;
```

### 3) PostCSS 설정에 플러그인 연결

`postcss.config.js`

```js
module.exports = {
  plugins: [
    require('./plugins/myAtRule')(),
    // require('tailwindcss')(), // Tailwind를 함께 쓴다면 순서를 적절히 배치
    // require('autoprefixer')(),
  ],
};
```

레이어 우선순위가 중요한 규칙이라면, 생성되는 CSS를 `@layer base|components|utilities` 안에 넣도록 플러그인에서 감쌀 수도 있습니다.

```js
const wrapped = `@layer utilities { .text-brand { color: #7c3aed; } }`;
atRule.replaceWith(postcss.parse(wrapped));
```

### 4) 사용 방법

`src/input.css`

```css
/* 커스텀 At-Rule 사용 */
@my-utilities;         /* .text-brand, .bg-brand 주입 */
@my-color #1e90ff;     /* .text-custom { color: #1e90ff } 주입 */

/* Tailwind와 함께라면: */
/* @tailwind base; */
/* @tailwind components; */
/* @tailwind utilities; */
```

빌드:

```bash
npx postcss src/input.css -o dist/output.css
```

### 5) 동작 원리 요약

- PostCSS는 CSS를 AST로 파싱 → 플러그인이 `@my-…` 같은 At-Rule 노드를 찾아 실제 CSS로 치환 → 최종 CSS 출력
- 브라우저는 커스텀 At-Rule을 모릅니다. 빌드 결과물만 해석합니다.
- Tailwind의 `@tailwind`도 같은 원리로, 플러그인이 대량의 유틸리티/컴포넌트 규칙을 삽입합니다.

## 2. 충돌 시 우선순위

Tailwind는 CSS를 세 개의 레이어로 구분하여 순서를 보장합니다.

-   **@layer base → components → utilities** 순서로 출력
-   유틸리티끼리 충돌 시 **"뒤에 쓴 클래스가 승리(last one wins)"**
-   JIT 모드에서는 HTML에서 뒤에 작성한 클래스가 이기도록 자동 정렬
-   반응형 변형은 브레이크포인트별로 더 구체적인 규칙이 우선

예시:

``` html
<div class="bg-red-500 bg-blue-500"></div>
```

→ `bg-blue-500`이 최종 적용됩니다.

## 3. 외부 CSS와 충돌 해결

필요하다면 아래와 같은 방법을 사용합니다.

-   **전역 강제**: `important: true` (tailwind.config.js)
-   **부분 강제**: `!bg-blue-500` (단일 속성만 `!important`)
-   **컴포넌트화**: @layer components 안에 커스텀 클래스를 정의하고,
    유틸리티로 추가 조정

## 4. BEM과의 비교

- Base Layer (@tailwind base): 브라우저 기본 스타일 초기화 (normalize/reset), 기본적인 HTML 요소(h1, p, a 등)에 대한 공통 스타일을 정의합니다. (가장 낮은 우선순위)
- Components Layer (@tailwind components): @apply 디렉티브를 사용하거나 커스텀 플러그인을 통해 재사용 가능한 컴포넌트 스타일을 정의하는 곳입니다.
- Utilities Layer (@tailwind utilities): Tailwind가 제공하는 핵심 유틸리티 클래스들 (예: flex, text-blue-500, p-4 등)이 위치하며, 가장 높은 우선순위를 가집니다.
Tailwind는 BEM 철학(낮은 특이성, 순서 기반 결정)을 계승하지만 더
자동화되어 있습니다.

  -----------------------------------------------------------------------
  항목               BEM                Tailwind
  ------------------ ------------------ ---------------------------------
  **클래스 수**      block, element,    하나의 요소에 10\~20개 유틸리티
                     modifier로 1\~3개  

  **CSS 관리 방식**  별도 CSS/SCSS 작성 JIT 생성 (사용한 클래스만 출력)

  **변형 관리**      modifier 클래스로  hover:, md:, dark: prefix
                     상태 표현          

  **추가 스타일링**  CSS 파일 수정 필요 HTML 클래스 추가만으로 즉시 적용
  -----------------------------------------------------------------------

결론적으로 Tailwind는 **BEM의 철학을 극단적으로 단순화하고 자동화한
시스템**으로,\
클래스 순서만으로 스타일 우선순위를 직관적으로 제어할 수 있습니다.

## 5. BEM vs Tailwind 예제 비교

아래는 동일한 버튼 UI를 BEM 방식과 Tailwind 방식으로 구현한 예제입니다.

### BEM 방식

HTML:
```html
<button class="btn btn--primary">
  클릭
</button>
```

CSS:
```css
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
}

.btn--primary {
  background-color: #3b82f6; /* blue-500 */
  color: white;
}

.btn--primary:hover {
  background-color: #2563eb; /* blue-600 */
}
```

### Tailwind 방식

HTML:
```html
<button class="px-4 py-2 rounded-lg font-bold bg-blue-500 hover:bg-blue-600 text-white">
  클릭
</button>
```

- 별도의 CSS 파일 없이 HTML 클래스만으로 스타일 정의
- hover 상태, 색상, padding, radius 등 즉시 조합 가능
- 특이성은 여전히 0-0-1 수준으로 유지

## 6. @layer Components 활용 예제

Tailwind에서는 `@layer components`를 활용하여 **재사용 가능한 컴포넌트 클래스**를 정의할 수 있습니다.  
이후 HTML에서 유틸리티 클래스로 쉽게 오버라이드할 수 있습니다.

### Tailwind 컴포넌트 정의

```css
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-bold;
  }

  .btn-primary {
    @apply bg-blue-500 text-white hover:bg-blue-600;
  }
}
```

### HTML 사용 예시

```html
<!-- 기본 버튼 -->
<button class="btn btn-primary">
  기본 버튼
</button>

<!-- Tailwind 유틸리티로 오버라이드 -->
<button class="btn btn-primary bg-green-500 hover:bg-green-600">
  초록 버튼
</button>
```

이 방식의 장점:
- **컴포넌트화**: 공통 스타일을 한 곳에서 정의 가능
- **유연한 오버라이드**: 필요할 때 유틸리티 클래스로 즉시 덮어쓰기
- **낮은 특이성 유지**: 여전히 0-0-1 수준 → 예측 가능

## 7. !important 옵션 활용

Tailwind에서는 외부 CSS와 충돌이 발생할 때 **우선순위를 강제로 높일** 수 있는 방법을 제공합니다.

### 1) 전역적으로 모든 유틸리티에 `!important` 적용

**tailwind.config.js**
```js
module.exports = {
  important: true, // 모든 유틸리티 클래스에 !important 추가
  content: ["./src/**/*.{html,js}"],
  theme: { extend: {} },
  plugins: [],
}
```

이렇게 하면 Tailwind에서 생성하는 모든 규칙이 `!important`로 출력되어  
외부 CSS(특히 라이브러리 스타일)를 강제로 덮어쓸 수 있습니다.

### 2) 특정 속성만 강제로 적용

HTML에서 개별 클래스에 `!` 접두사를 붙입니다.

```html
<div class="bg-red-500 !text-white">
  항상 흰색 텍스트
</div>
```

출력되는 CSS:
```css
.text-white {
  color: white !important;
}
```

이 방식은 **특정 속성만 우선 적용**하고 싶을 때 매우 편리합니다.

## 8. 디자인 시스템과 디자인 토큰

### **문제**

  - 팀/플랫폼마다 같은 개념(예: '빨간색')을 다른 값(예: #FF0000 vs #E74C3C)으로 사용하는 현상

### **문제의 본질**

  - '단일 진실 공급원(Single Source of Truth)'의 부재와 '의미론적 불일치'

  - 이 문제의 핵심은 특정 요소(색상, 폰트 크기, 간격 등)에 대한 단일하고 통일된 정의가 없다는 것입니다. 각 팀이나 플랫폼이 자신의 환경에 맞춰 독립적으로 값을 정의하고 사용하면서 발생합니다.

  - 디자인 시스템(Design System)을 구축하고, 그 핵심 요소로 디자인 토큰(Design Tokens)을 활용하는 것입니다.

### **디자인 시스템 구축**

  - 제품의 모든 디자인 요소를 명확히 정의하고 문서화하는 통일된 라이브러리입니다. 색상, 타이포그래피, 간격, 컴포넌트 등을 포함합니다. 
  - 디자이너와 개발자가 공유하는 단일 진실 공급원이 됩니다.

### **디자인 토큰 활용**:
  - 특정 값( #FF0000, 16px)을 직접 사용하는 대신, 의미론적인 이름(--color-brand-primary, --spacing-medium)으로 추상화된 변수를 사용합니다.
  이 토큰은 디자인 툴에서도, 코드에서도 동일하게 사용될 수 있도록 변환(export)됩니다.
  - 예시:
  color-brand-primary = #FF0000 (디자이너)
  --color-brand-primary: #FF0000; (웹 개발자 CSS 변수)
  @colorBrandPrimary = #FF0000; (iOS 개발자 Swift 변수)

  - 이렇게 하면 #FF0000을 #E74C3C로 변경하더라도, 디자이너와 개발자는 color-brand-primary라는 토큰 이름만 알고 있으면 되고, 실제 값은 디자인 시스템에서 일괄적으로 관리 및 업데이트됩니다.

  - 정기적인 협업 및 소통: 디자인 및 개발 팀 간의 정기적인 싱크업 미팅, 공동 워크숍을 통해 디자인 시스템을 함께 발전시켜 나갑니다.


### 1) 왜 필요한가

- **일관성 부족**: 팀/플랫폼마다 같은 개념을 다른 값으로 사용(예: 디자이너의 red는 `#FF0000`, 개발자의 red는 `#E74C3C`).
- **유지보수 어려움**: 브랜드 색상 변경 시 하드코딩 값을 전역 검색·치환해야 함.
- **플랫폼 간 불일치**: 웹(CSS 변수), iOS(Swift), Android(XML) 등 각각 따로 관리되며 불일치 발생.
- **소통 장벽**: “브랜드 프라이머리” vs `#007bff`처럼 의미와 값이 분리되어 혼선.

### 2) 무엇을 담는가(예시)

- Color: `color-brand-primary`, `color-background-default`, `color-text-danger`
- Typography: `font-family-body`, `font-size-h1`, `line-height-body`
- Spacing: `spacing-sm`, `spacing-md`, `spacing-lg`(예: 4px, 8px, 16px)
- Shadow: `shadow-elevation-1`, `shadow-modal`
- Border Radius: `border-radius-sm`, `border-radius-pill`
- Animation: `animation-duration-fast`, `animation-easing-default`
- Z-index: `z-index-modal`, `z-index-dropdown`

핵심은 “이름(semantic)”입니다. 단순 값이 아니라 의미를 담은 이름(예: `color-text-danger`).

### 3) 어떻게 작동하는가(프로세스)

1. 정의(Design): Figma/Sketch 등 또는 JSON/YAML로 토큰 정의(예: `color-brand-primary: #007bff`).
2. 중앙 저장소: 플랫폼 중립(JSON/YAML)으로 관리.
3. 변환(Transformation): Style Dictionary 등으로 각 플랫폼 형식으로 변환.
4. 사용(Usage):

CSS
```css
:root {
  --color-brand-primary: #007bff;
  --spacing-md: 16px;
}
.button {
  background-color: var(--color-brand-primary);
  padding: var(--spacing-md);
}
```

Sass/Less
```scss
$color-brand-primary: #007bff;
$spacing-md: 16px;
.button { background-color: $color-brand-primary; padding: $spacing-md; }
```

iOS(Swift)
```swift
extension UIColor { static let brandPrimary = UIColor(hex: "#007bff") }
// 사용: myView.backgroundColor = .brandPrimary
```

Android(XML)
```xml
<!-- colors.xml -->
<color name="color_brand_primary">#007bff</color>
```

### 4) 장점

- 단일 진실 공급원(SSOT) 확보로 불일치 방지
- 전 플랫폼 일관성
- 변경 용이(토큰만 수정하면 전파)
- 확장성/협업 강화
- 테마 전환 용이(라이트/다크 등)

### 5) Tailwind와 디자인 토큰

Tailwind는 `tailwind.config.js`의 설정이 사실상 “토큰” 역할을 합니다. 여기서 정의한 값으로 유틸리티 클래스가 생성됩니다.

`tailwind.config.js`
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // 색상 토큰
      colors: {
        'brand-primary': '#6366F1',
        'brand-secondary': '#8B5CF6',
        'neutral-light': '#F3F4F6',
        'neutral-dark': '#1F2937',
        'error': '#EF4444',
        'success': '#22C55E',
      },
      // 간격 토큰
      spacing: {
        xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem',
        '2xl': '3rem', header: '4rem',
      },
      // 폰트 토큰
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      // 그림자 토큰
      boxShadow: {
        card: '0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06)',
        modal: '0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04)'
      },
      // 곡률 토큰
      borderRadius: { sm: '0.125rem', md: '0.25rem', lg: '0.5rem', full: '9999px' },
      // 트랜지션 토큰
      transitionDuration: { default: '150ms', fast: '75ms', slow: '300ms' },
    },
  },
  plugins: [],
}
```

이렇게 정의하면 다음과 같은 클래스가 생성·사용됩니다: `text-brand-primary`, `bg-neutral-light`, `shadow-card`, `rounded-lg`, `duration-fast` 등. 의미 있는 토큰을 참조하므로 하드코딩 값 대신 일관된 언어를 사용하게 됩니다.

### 6) 외부 토큰 시스템과 통합

Style Dictionary/Figma Tokens 등에서 만든 CSS 변수를 Tailwind가 소비하도록 할 수 있습니다.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--ds-color-primary)',
        secondary: 'var(--ds-color-secondary)'
      }
    }
  },
  plugins: []
}
```

요약: Tailwind는 토큰을 “생성”하는 도구는 아니지만, `tailwind.config.js`로 토큰을 “정의/활용”하기에 매우 강력한 환경을 제공합니다.

## 9. react에서의 tailwind 활용

### 설치/세팅 (Vite 기준)

```bash
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js`
```js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
}
```

`src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

엔트리에서 전역 임포트:
```tsx
// src/main.tsx
import './index.css'
```

### 컴포넌트 작성 패턴

1) 기본 사용
```tsx
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
      {children}
    </button>
  )
}
```

2) 조건부 클래스(`clsx` 추천)
```bash
npm i clsx
```
```tsx
import { clsx } from 'clsx'

type Props = { variant?: 'primary' | 'ghost'; disabled?: boolean; children: React.ReactNode }

export function Btn({ variant = 'primary', disabled, children }: Props) {
  const classes = clsx(
    'inline-flex items-center px-4 py-2 rounded-md transition-colors',
    variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
    variant === 'ghost' && 'bg-transparent text-blue-600 hover:bg-blue-50',
    disabled && 'opacity-50 pointer-events-none'
  )
  return <button className={classes}>{children}</button>
}
```

3) 변형 스케일 정리(`cva` 선택)
```bash
npm i class-variance-authority
```
```tsx
import { cva } from 'class-variance-authority'

const button = cva(
  'inline-flex items-center rounded-md transition-colors',
  {
    variants: {
      intent: { primary: 'bg-blue-600 text-white hover:bg-blue-700', ghost: 'text-blue-600 hover:bg-blue-50' },
      size: { sm: 'px-2 py-1 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' },
    },
    defaultVariants: { intent: 'primary', size: 'md' },
  }
)

export function Button({ intent, size, children }: { intent?: 'primary' | 'ghost'; size?: 'sm' | 'md' | 'lg'; children: React.ReactNode }) {
  return <button className={button({ intent, size })}>{children}</button>
}
```

### 다크 모드/테마

- Tailwind 기본은 `class` 전략: `<html class="dark">`일 때 `dark:bg-neutral-900` 적용
- 디자인 토큰을 CSS 변수로 정의하고, 다크 모드에서 변수 값만 전환하면 컴포넌트 수정 없이 테마 변경 가능

```css
:root { --color-bg: 255 255 255; }
.dark { --color-bg: 17 24 39; }
.card { background-color: rgb(var(--color-bg)); }
```

### 폴더 구조 권장

```
src/
  components/
    ui/        # 원자/분자 컴포넌트 모음 (tailwind 유틸 중심)
    domain/    # 도메인 컴포넌트 (비즈니스 상태/로직 포함)
  styles/
    index.css  # @tailwind 지시어, 전역 토큰
```

### 테스트 팁

- 스냅샷 테스트는 클래스 문자열이 길어 가독성이 떨어질 수 있으므로, 역할(role)과 상호작용 위주 테스트를 권장
- 접근성 속성(aria-*)과 포커스 링(`focus-visible:ring`) 동작을 함께 확인

### 성능 팁

- 프로덕션 빌드에선 `content` 경로 정확히 지정하여 미사용 클래스 제거
- 큰 프로젝트는 `@apply`로 자주 쓰는 패턴을 컴포넌트 레이어에 추출해 중복을 줄임
