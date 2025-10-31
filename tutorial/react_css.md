# React+Tailwind+shadcn 환경에서 "단일클래스 + BEM"이 어려운 이유와, 현업에서 쓰는 CSS 전략

> 수업용 교재 (MD 버전). React + Tailwind CSS + shadcn/ui 조합을 기준으로 설명합니다.

---

## 1) 요약 (TL;DR)
- **BEM의 목표**는 전역 CSS 환경에서 **명명 규칙**으로 충돌/특이성 혼전을 줄이는 것.
- **현대 프론트엔드(React + Tailwind + shadcn)**는 컴포넌트 단위 격리, 유틸리티 클래스, 토큰 기반 테마, 상태/변형(variant) 시스템으로 문제를 **다른 방식**으로 해결.
- **단일클래스(one class per element) + BEM**은 Tailwind의 **원자적(utility-first)** 스타일, shadcn의 **cva 변형 API**, React의 **상태 구동 UI**와 **철학이 상충**하여 생산성이 급격히 떨어짐.
- **현업 대안**: _유틸리티 우선 + 컴포넌트 변형(variants) + 디자인 토큰_ 조합. 필요 시 **CSS Modules**/**전역 레이어(@layer)**/**data-attributes**를 혼합.

---

## 2) 단일클래스 + BEM이 현대 스택에서 어려운 이유

### 2.1 Tailwind의 철학과 충돌
- Tailwind는 **원자적 유틸리티 클래스**를 HTML에 직접 합성하도록 권장합니다.
- BEM은 **도메인 의미를 가진 블록/요소/모디파이어 클래스**를 중심으로 **컴포넌트 외부의 CSS 파일**에 규칙을 적재합니다.
- 결과적으로 Tailwind 환경에서 BEM을 고수하면:
  - 동일한 UI를 만들기 위해 **CSS 파일에 규칙을 재정의**해야 하고,
  - 유틸리티 합성의 장점(빠른 실험, 즉시 피드백, 미사용 클래스 제거(Tree-shaking/JIT))가 **감소**합니다.

### 2.2 상태/변형(variants) 폭발 문제
- shadcn/ui는 **cva(Class Variance Authority)**로 `size`, `variant`, `state` 같은 **다차원 변형**을 클래스 조합으로 해결합니다.
- BEM에서 동일 기능을 하려면 `button--primary`, `button--lg`, `button--ghost`, `button--disabled`…가 **조합 폭발**을 일으켜 클래스 수가 기하급수적으로 늘어납니다.

### 2.3 컴포넌트 경계와 스타일의 **공위치(co-location)**
- React는 **스타일과 로직을 같은 파일/폴더에 공위치**하는 패턴이 일반적입니다.
- BEM은 전통적으로 **전역 CSS/SCSS** 설계에 최적화되어, **컴포넌트 캡슐화**(파일 단위, 모듈 단위)와 자연스럽게 어울리지 않습니다.

### 2.4 특이성(specificity) 모델의 차이
- Tailwind는 대부분 **단일 클래스** 특이성(0-1-0)으로 평평한 필드를 유지, `!important`를 지양.
- BEM도 낮은 특이성을 지향하지만, **중첩/컨텍스트 의존** 규칙이 늘며 유지보수 시 특이성 상승을 유발하기 쉽습니다.

### 2.5 디자인 토큰과 테마의 1급 시민화
- Tailwind의 `theme()`/설정 파일, CSS 변수, shadcn의 토큰화는 **디자인 시스템 중심**.
- BEM은 **명명 규칙**에 집중하고 **토큰 관리**는 별도 체계가 필요합니다.

### 2.6 빌드/성능 관점
- Tailwind JIT는 사용한 유틸리티만 **정밀 추출**합니다.
- BEM 전개는 **규칙 중심**이라 사용하지 않는 규칙이 **번들에 잔류**하기 쉬우며, **트리셰이킹 이점**이 약합니다.

---

## 3) 현업에서 쓰는 CSS 전략 (React + Tailwind + shadcn 기준)

### 3.1 기본 원칙
1. **유틸리티 우선(Utility-first)**: 레이아웃/스페이싱/타이포/컬러 등은 **Tailwind 클래스**로 직접 구성.
2. **컴포넌트 변형(Variants)**: 상호배타적 상태, 사이즈, 강조도는 **cva** 또는 **clsx** 조합으로 관리.
3. **토큰 우선(Design tokens)**: 색/간격/둥근 정도/그림자 등은 **Tailwind theme 확장 + CSS 변수**로 통일.
4. **접근성/상태는 data-attributes**: `data-[state=open]`, `aria-*`에 반응하는 **유틸리티/레이어 규칙**을 사용.
5. **전역은 최소화, 레이어드 설계**: 꼭 필요한 전역 규칙은 `@layer base|components|utilities`로 얕게 정의.

### 3.2 실전 패턴
- **(A) 버튼 같은 자주 쓰는 컴포넌트**
  - `cva`로 변형 정의 → 화면에서는 `cn(buttonVariants({ variant: 'primary', size: 'lg' }))` 식으로 사용
  - 아이콘 포함, 로딩 상태, 비활성 상태는 **data-attribute**/`aria-disabled`와 유틸리티 조합

- **(B) 복잡한 내부 레이아웃**
  - 80~90%는 Tailwind 유틸리티로 구성
  - 반복되는 묶음은 `@apply`(로컬 모듈 or 전역 components 레이어)로 **부분 추상화**

- **(C) 제3자 UI와의 통합** (Radix, shadcn/ui)
  - 라이브러리 컴포넌트가 노출하는 `data-*` 상태 훅을 사용해 **컨텍스트 의존 없이 스타일링**

- **(D) 페이지/앱 전역 타이포/리셋**
  - `@layer base`에 최소 리셋/폰트/문서 전역 토큰 변수만 정의

- **(E) 모듈화가 필요한 경우**
  - 특정 컴포넌트만의 복잡한 알고리즘/애니메이션은 **CSS Modules** 또는 **Scoped CSS**(예: `Component.module.css`)로 캡슐화

### 3.3 선택적으로 섞는 도구
- **clsx**: 조건부 클래스 합성
- **cva**: 변형(variants) 선언형 관리
- **tailwind-merge(twMerge)**: 충돌 유틸리티 정리
- **CSS Modules**: 국소적 복잡 규칙 분리
- **PostCSS + @layer**: 얕은 전역 규칙 관리

---

## 4) 비교: BEM vs Tailwind + Variants

### 4.1 버튼 예시
**BEM 스타일(단일클래스 지향)**
```html
<button class="btn btn--primary btn--lg">
  Save
</button>
```
```css
.btn { /* 기본 버튼 규칙 */ }
.btn--primary { /* 색/테마 */ }
.btn--lg { /* 사이즈 */ }
.btn--primary.btn--lg { /* 조합 케이스가 늘어남 */ }
```

**Tailwind + cva (shadcn 패턴)**
```ts
// button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
```
사용 시:
```jsx
<Button variant="default" size="lg">Save</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

- **차이점**: Tailwind + cva는 **조합식 변형**을 타입 안전/선언적으로 관리. BEM은 조합 수가 늘수록 **클래스 폭발**.

### 4.2 상태 스타일링 (data-attributes)
**BEM식 컨텍스트 의존**
```css
.modal .btn--close { /* 모달 내부 버튼에만 작동 */ }
```
- 컨텍스트 의존이 늘며 재사용성 하락.

**현대 패턴 (data-state)**
```html
<Dialog data-state="open">...</Dialog>
```
```css
/* Tailwind 예: */
/***** globals.css *****/
@layer utilities {
  .data-open\:animate-in[data-state="open"] { animation: fadeIn 0.2s; }
}
```
- 또는 컴포넌트에 `data-[state=open]:animate-in` 같은 **유틸리티 프리픽스**를 직접 사용.

---

## 5) 단일클래스 + BEM을 여전히 써야 하는 경우
- **레거시 전역 CSS**가 방대하고 Tailwind 도입이 어려움.
- **디자인 시스템이 미정**이고, 팀이 CSS 관점에서만 일관성을 강제하려는 초기 단계.
- **React 외부/서버 렌더링이 제한된 환경**에서 전통적 빌드 파이프라인만 허용될 때.

> 이 경우에도 **특이성 얕게 유지**, **중첩 금지**, **모디파이어 최소화**, **토큰(변수) 활용**을 권고.

---

## 6) 팀 가이드라인(체크리스트)
- [ ] 공통 컴포넌트는 **cva + Tailwind**로 변형을 모델링한다.
- [ ] **토큰(색/간격/타이포)**은 Tailwind 설정/변수로 중앙관리한다.
- [ ] 상태는 **`data-*`/`aria-*`**로 표준화한다.
- [ ] 전역 규칙은 **`@layer base|components|utilities`**에 한정하고, 특이성은 **단일 클래스(0-1-0)**를 유지한다.
- [ ] 복잡 스타일은 **CSS Modules**로 로컬 캡슐화한다.
- [ ] 클래스 합성은 **`clsx` + `tailwind-merge`**를 사용한다.

---

## 7) 마이그레이션 전략 (BEM → Tailwind + shadcn)
1. **토큰 추출**: SCSS 변수/믹스인 → Tailwind `theme` & CSS 변수로 이관
2. **컴포넌트 단위 리팩터링**: 빈도 높은 UI부터 `cva` 변형화
3. **전역 CSS 다이어트**: `@layer components`에 꼭 필요한 규칙만 유지
4. **E2E/비주얼 리그레션 테스트**로 안정성 확보

---

## 8) Q&A 예상 질문
- **Q. 유틸리티 클래스가 너무 길어져 읽기 힘든데요?**
  - A. 빈번한 패턴만 `cva`/`@apply`로 추상화. 나머지는 유틸리티 그대로 두는 것이 유지보수에 유리.
- **Q. 디자인이 자주 바뀌면?**
  - A. 토큰을 조정하면 대다수 화면은 자동 전파. 유틸리티 조합이므로 대역폭이 빠릅니다.
- **Q. CSS-in-JS는 안 쓰나요?**
  - A. 프로젝트 성격/런타임 제약에 따라 사용. 다만 Tailwind + variants로 커버 가능한 범위가 크고, SSR/성능 비용을 줄이기 쉬움.

---

## 9) 결론
- **단일클래스 + BEM**은 전역 CSS 시대의 강력한 패턴이었으나,
- **React + Tailwind + shadcn** 조합에서는 **유틸리티/변형/토큰/데이터속성** 중심의 전략이 **생산성과 유지보수성** 모두에서 우수합니다.
- 실무에서는 **하이브리드**가 정답: _유틸리티 우선_을 기본으로, 필요한 곳에만 **cva/Modules/@layer**를 섞어 **특이성 낮게, 변형은 선언적으로** 관리하세요.

