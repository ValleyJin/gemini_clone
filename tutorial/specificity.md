# CSS 특이성(Specificity) 계산과 우선순위

## 특이성 계산 공식

### 기본 공식
```
특이성 = [인라인 스타일, ID, 클래스/속성/가상클래스, 요소/가상요소]
```

### 각 자리의 의미
1. **첫 번째 자리**: 인라인 스타일 (`style=""`)
2. **두 번째 자리**: ID 선택자 (`#id`)
3. **세 번째 자리**: 클래스, 속성, 가상 클래스 선택자
4. **네 번째 자리**: 요소, 가상 요소 선택자

## `.container .suggestions` 특이성 계산

### 선택자 분해
```css
.container .suggestions
```

- `.container` → **클래스 선택자** (세 번째 자리 +1)
- `.suggestions` → **클래스 선택자** (세 번째 자리 +1)

### 계산 과정
```
초기값: 0,0,0,0

.container (클래스 1개)
→ 0,0,1,0

.suggestions (클래스 1개 더)
→ 0,0,2,0
```

### 결과
```css
.container .suggestions {
    /* 특이성: 0,0,2,0 */
    display: flex;
}
```

## `:where()` vs `:is()` 특이성 차이

### `:where()` - 특이성 0
- `:where()` **자체의 특이성은 0**
- `:where()` **안의 선택자들은 특이성 계산에서 제외**

```css
/* 특이성: 0,0,1,0 (클래스 1개만) */
.container :where(.app-header, .suggestions) {
    display: none;
}
```

### `:is()` - 특이성 유지
- `:is()` **안의 선택자들 중 가장 높은 특이성을 가져옴**
- **모든 선택자를 계산하지 않고, 가장 높은 것만**

```css
/* 특이성: 0,0,2,0 (클래스 2개) */
/* .container 클래스 1개, ()안의 클래스 1개만  */
.container :is(.app-header, .suggestions) {
    display: none;
}
```

## 동일한 특이성일 때의 우선순위

### CSS 선언 순서가 중요
```css
/* 1. 먼저 선언 (특이성: 0,0,2,0) */
.container .suggestions {
    display: flex;
    gap: 15px;
    margin-top: 9.5vh;
    /* ... */
}

/* 2. 나중에 선언 (특이성: 0,0,2,0) */
.container :is(.app-header, .suggestions) {
    display: none; /* 이게 적용됨! */
}
```

### CSS 우선순위 전체 규칙
1. **특이성** (가장 중요)
2. **선언 순서** (특이성이 동일할 때)
3. **!important** (강제 우선순위)
4. **인라인 스타일** (HTML에서 직접 선언)

## 실제 적용 과정

### 1단계: 첫 번째 규칙 적용
```css
.container .suggestions {
    display: flex; /* 적용됨 */
    gap: 15px;
    margin-top: 9.5vh;
    /* ... */
}
```

### 2단계: 두 번째 규칙이 덮어씀
```css
.container :is(.app-header, .suggestions) {
    display: none; /* 이게 나중에 선언되어 덮어씀 */
}
```

## 시각적 표현

```
CSS 파일 순서:
1. .container .suggestions { display: flex; }     ← 먼저 적용
2. .container :is(.app-header, .suggestions) {    ← 나중에 적용
     display: none; }                             ← 덮어씀!
```

## 특이성 비교 예시

### 낮은 특이성
```css
.suggestions {
    /* 특이성: 0,0,1,0 */
    display: block;
}

div {
    /* 특이성: 0,0,0,1 */
    display: inline;
}
```

### 동일한 특이성
```css
.container .suggestions {
    /* 특이성: 0,0,2,0 */
    display: flex;
}

.header .nav {
    /* 특이성: 0,0,2,0 */
    display: block;
}
```

### 더 높은 특이성
```css
#main .container .suggestions {
    /* 특이성: 0,1,2,0 */
    display: none;
}

.container .suggestions:hover {
    /* 특이성: 0,0,3,0 */
    background: red;
}
```

## 실용적인 사용법

### `:where()` 사용 시기
- **특이성을 낮춰서** 나중에 쉽게 덮어쓰고 싶을 때
- **재사용 가능한** 기본 스타일을 만들 때

### `:is()` 사용 시기
- **특이성을 유지**해서 강력한 선택자가 필요할 때
- **기존 스타일을 덮어쓰고** 싶을 때

## 실무에서의 특이성 점수 전략

### 낮은 특이성 점수 (1-2점) - 일반적인 사용

#### 1점: 기본 컴포넌트
```css
.button { /* 0,0,1,0 */ }
.card { /* 0,0,1,0 */ }
.widget { /* 0,0,1,0 */ }
```

#### 2점: 컨테이너 내 컴포넌트
```css
.container .button { /* 0,0,2,0 */ }
.container .card { /* 0,0,2,0 */ }
.container .widget { /* 0,0,2,0 */ }
```

### 중간 특이성 점수 (3점) - 상태 변경

#### 상태 기반 스타일링
```css
.button:hover { /* 0,0,1,1 */ }
.button.active { /* 0,0,1,1 */ }
.button:disabled { /* 0,0,1,1 */ }
```

#### 가상 클래스 조합
```css
.container .button:hover { /* 0,0,2,1 */ }
.container .button:active { /* 0,0,2,1 */ }
```

### 높은 특이성 점수 (4점 이상) - 특별한 경우

#### 1. 라이브러리/프레임워크 오버라이드
```css
/* 외부 라이브러리 스타일 덮어쓰기 */
.bootstrap .btn { /* 0,0,2,0 */ }
.my-app .bootstrap .btn { /* 0,0,3,0 */ } /* 라이브러리 스타일 덮어쓰기 */
```

#### 2. 중요한 상태 변경
```css
/* 기본 스타일 */
.widget .button { /* 0,0,2,0 */ }

/* 중요한 상태 */
.widget .button--active { /* 0,0,2,0 */ }
.widget .button--active:hover { /* 0,0,2,2 */ } /* 4점으로 확실한 덮어쓰기 */
```

#### 3. 테마/스킨 시스템
```css
/* 기본 테마 */
.theme-light .button { /* 0,0,2,0 */ }

/* 다크 테마 */
.theme-dark .theme-light .button { /* 0,0,3,0 */ } /* 테마 오버라이드 */
```

#### 4. 컴포넌트 내부의 복잡한 구조
```css
/* 기본 컴포넌트 */
.card { /* 0,0,1,0 */ }

/* 복잡한 내부 구조 (정말 필요한 경우만) */
.card .header .title .text { /* 0,0,4,0 */ }
```

## 실무에서의 특이성 관리 전략

### 1. 직접 부모만 사용하는 패턴
```css
/* ❌ 너무 깊은 선택자 */
.container .suggestions .suggestion-item .item-content .item-title { /* 0,0,5,0 */ }

/* ✅ 직접 부모만 사용 */
.container .suggestion-item { /* 0,0,2,0 */ }
.container .item-content { /* 0,0,2,0 */ }
.container .item-title { /* 0,0,2,0 */ }
```

### 2. 컴포넌트 기반 접근
```css
/* 컴포넌트별로 직접 부모만 사용 */
.card { /* 0,0,1,0 */ }
.card__header { /* 0,0,1,0 */ }
.card__title { /* 0,0,1,0 */ }
.card__content { /* 0,0,1,0 */ }
.card__footer { /* 0,0,1,0 */ }

/* 또는 컨테이너 기반 */
.container .card { /* 0,0,2,0 */ }
.container .card__header { /* 0,0,2,0 */ }
.container .card__title { /* 0,0,2,0 */ }
```

### 3. 레이어링 전략
```css
/* 기본 레이어 (1-2점) */
.base-component { }
.container .base-component { }

/* 상태 레이어 (3점) */
.base-component:hover { }
.base-component.active { }

/* 오버라이드 레이어 (4점 이상) */
.important .base-component { }
```

## 실무에서 피해야 할 패턴

### 1. 과도한 특이성 점수
```css
/* ❌ 너무 높은 특이성 점수 */
.page .container .widget .header .title .text { /* 0,0,6,0 */ }

/* ✅ 적절한 특이성 점수 */
.widget .title { /* 0,0,2,0 */ }
.widget .text { /* 0,0,2,0 */ }
```

### 2. 순서 의존성
```css
/* ❌ 순서에 의존적인 코드 */
.old-style { color: red; }
.new-style { color: blue; } /* 순서가 바뀌면 문제 */

/* ✅ 명확한 특이성 차이 */
.old-style { color: red; }
.widget .new-style { color: blue; } /* 특이성으로 구분 */
```

## 특이성 점수별 사용 가이드

### 1점: 기본 컴포넌트
- 재사용 가능한 기본 스타일
- 전역 스타일

### 2점: 컨테이너 내 컴포넌트
- 가장 일반적인 패턴
- 예측 가능한 특이성

### 3점: 상태/변형
- 호버, 활성 상태
- 가상 클래스 조합

### 4점 이상: 특별한 경우
- 외부 라이브러리 오버라이드
- 테마 시스템
- 복잡한 컴포넌트 내부 구조

## 결론

- **CSS 효과**: `.container .suggestions`와 `.suggestions`는 동일한 요소에 같은 스타일 적용
- **특이성**: `.suggestions` (0,0,1,0) vs `.container .suggestions` (0,0,2,0)
- **차이점**: 나중에 다른 CSS 규칙과 충돌할 때만 나타남
- **동일한 특이성일 때**: CSS 파일에서 나중에 선언된 규칙이 우선
- **선택 기준**: 프로젝트의 CSS 아키텍처와 유지보수성 고려
- **실무 권장**: 1-2점을 기본으로 하고, 3점 이상은 정말 필요한 경우에만 사용
