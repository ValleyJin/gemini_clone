# 단일 클래스 + BEM 방법론

단일 클래스(Single Class) 원칙과 BEM(Block, Element, Modifier) 방법론은 웹 개발에서 CSS를 조직하고 관리하는 데 사용되는 강력한 접근 방식입니다. 이 둘은 독립적인 개념이지만, 함께 사용될 때 CSS의 유지보수성, 확장성, 예측 가능성을 크게 향상시킬 수 있습니다.

## 1. BEM(Block, Element, Modifier) 방법론이란?

BEM은 UI를 재사용 가능하고 확장 가능한 컴포넌트로 분해하여 CSS 클래스 이름에 특정 명명 규칙을 적용하는 방법론입니다. Block, Element, Modifier의 세 가지 구성 요소로 나뉩니다.

### Block (블록)
독립적으로 재사용 가능한 UI 컴포넌트입니다. 페이지 어디에나 배치될 수 있으며, 그 자체로 의미를 가집니다.

- **예시**: `button`, `header`, `card`, `menu`
- **클래스 이름**: `block-name`

### Element (엘리먼트)
블록의 구성 요소이며, 블록의 일부로서만 의미를 가집니다. 엘리먼트는 블록에 종속됩니다.

- **예시**: `button` 블록의 `icon`, `card` 블록의 `title`
- **클래스 이름**: `block-name__element-name` (블록 이름 뒤에 이중 언더스코어 `__`로 연결)

### Modifier (모디파이어)
블록이나 엘리먼트의 모양, 상태 또는 동작을 정의합니다. 같은 블록이나 엘리먼트라도 특정 상황에 따라 다르게 보일 때 사용합니다.

- **예시**: `button` 블록의 `primary` (기본), `disabled` (비활성화); `menu` 블록의 `open` (열린 상태)
- **클래스 이름**: `block-name--modifier-name` 또는 `block-name__element-name--modifier-name` (블록/엘리먼트 이름 뒤에 이중 하이픈 `--`로 연결)

### BEM의 목적

- 클래스 이름만으로 HTML 요소의 구조와 목적을 명확히 파악할 수 있게 합니다.
- CSS 선택자 충돌을 방지하고 예측 가능한 스타일링을 가능하게 합니다.
- 코드 재사용성을 높이고 유지보수를 용이하게 합니다.

## 2. 단일 클래스(Single Class) 원칙이란?

"단일 클래스 원칙"은 특정 CSS 규칙 세트가 하나의 독립적인 클래스에만 연결되도록 하는 접근 방식입니다. 이는 다음과 같은 패턴을 지양합니다.

### 지양해야 할 패턴

- **복합 선택자 (Chained Selectors)**: `.button.button--primary`와 같이 여러 클래스를 동시에 선택하는 방식 (CSS 파일에서)
- **하위 선택자 (Descendant Selectors)**: `.block .element`와 같이 부모-자식 관계를 통해 선택하는 방식
- **ID 선택자**: `#myId`와 같이 고유 ID를 사용하는 방식
- **태그 선택자**: `div`, `p`와 같이 HTML 태그를 직접 선택하는 방식

### 단일 클래스 원칙의 핵심

- **낮은 명시도(Low Specificity)**: 모든 클래스가 거의 동일한 낮은 명시도를 갖도록 하여 스타일 우선순위 충돌을 최소화합니다.
- **명확한 맵핑**: HTML의 `class` 속성에 있는 각 클래스가 CSS 파일에서 독립적인 스타일 규칙을 가집니다. 즉, 하나의 클래스가 하나의 독립적인 목적(스타일 셋)을 담당합니다.
- **예측 가능성**: 클래스 이름을 보면 어떤 스타일이 적용될지 명확하게 알 수 있습니다.

## 3. BEM 방법론+단일 클래스의 결합

이 두 가지를 함께 사용할 때의 핵심은 HTML에서는 BEM 규칙에 따라 클래스 이름을 만들되, CSS 코드 작성 시에는 해당 BEM 클래스들을 단일 클래스 선택자로 개별적으로 특정하여 디자인 효과를 규정한다는 것입니다. 따라서 여러개의 클래스로 지정된 HTML 요소는 이러한 개별적인 CSS효과들이 중첩되어 완성되어지는 것입니다.

### 예시

#### HTML 코드
```html
<button class="button button--primary button--large">
    <span class="button__icon">✨</span>
    <span class="button__text">클릭하세요</span>
</button>
```

#### CSS 코드 (단일 클래스 + BEM 원칙 적용)
```css
/* Block */
.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f0f0f0;
    cursor: pointer;
    font-size: 16px;
    color: #333;
    /* 다른 기본 스타일 */
}

/* Element */
.button__icon {
    margin-right: 5px;
}

.button__text {
    /* 특정 텍스트 스타일 */
}

/* Modifiers */
.button--primary {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}

.button--large {
    font-size: 18px;
    padding: 12px 20px;
}

/* Modifier for Element */
/* (예시: 특정 아이콘만 다르게 스타일링하고 싶을 때) */
/* .button__icon--alert { color: red; } */
```

### 이 결합의 의미

1. **HTML에서는 여러 클래스 사용**: HTML 요소에는 기본 블록(`button`), 엘리먼트(`button__icon`), 필요한 모디파이어(`button--primary`, `button--large`) 클래스를 모두 적용합니다.

2. **CSS에서는 단일 클래스 선택자 사용**: CSS 스타일 규칙을 작성할 때는 `.button`, `.button__icon`, `.button--primary`, `.button--large`와 같이 각각의 클래스를 독립적인 선택자로 사용합니다. `button.button--primary`와 같은 복합 선택자를 사용하지 않습니다.

3. **명시도 관리**: 모든 BEM 클래스들이 동일한 낮은 명시도를 갖게 되어, CSS 규칙의 우선순위가 HTML에 클래스가 선언된 순서나 CSS 파일 내 규칙의 선언 순서에 따라 예측 가능하게 결정됩니다. 이는 나중에 스타일을 재정의하거나 디버깅할 때 매우 유용합니다.

## 주요 특징 및 장점

- **명확한 구조**: BEM의 명명 규칙 덕분에 HTML과 CSS 코드만 봐도 UI의 구조와 관계를 쉽게 이해할 수 있습니다.
- **재사용성 극대화**: 블록, 엘리먼트, 모디파이어가 독립적인 클래스로 존재하므로, 필요한 곳에 언제든지 가져다 쓸 수 있습니다.
- **예측 가능한 스타일**: 단일 클래스 원칙은 CSS 명시도 충돌을 최소화하여 어떤 스타일이 적용될지 예측하기 쉽게 만듭니다.
- **유지보수 용이성**: 특정 컴포넌트의 스타일을 변경할 때, 다른 부분에 영향을 줄 가능성이 매우 낮아집니다.
- **확장성**: 프로젝트 규모가 커지고 팀원이 많아져도 일관된 규칙 덕분에 코드 베이스를 쉽게 확장할 수 있습니다.
- **쉬운 디버깅**: 스타일 문제가 발생했을 때, 문제가 되는 클래스를 HTML에서 찾아 해당 클래스의 CSS 규칙만 확인하면 되므로 디버깅이 간편합니다.

## 고려사항 (단점)

- **장황한 클래스 이름**: BEM 명명 규칙 자체가 다소 길고 반복적일 수 있습니다. 특히 모디파이어가 많아지면 클래스 이름이 더 길어질 수 있습니다.
- **HTML의 복잡성**: HTML 코드에 많은 클래스가 나열될 수 있어, HTML 마크업이 다소 장황해 보일 수 있습니다.
- **초기 학습 곡선**: BEM 원칙과 단일 클래스 원칙을 엄격하게 적용하는 데 익숙해지는 데 시간이 걸릴 수 있습니다.

## 결론

단일 클래스 + BEM 방법론은 대규모 웹 프로젝트에서 CSS를 체계적으로 관리하고, 예측 가능하며 재사용 가능한 컴포넌트 기반의 UI를 구축하는 데 매우 효과적인 전략입니다.