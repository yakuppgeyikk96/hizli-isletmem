---
name: tailwind-review
description: Review Tailwind CSS and shadcn/ui code for clean utility usage, design token consistency, responsive patterns, and component customization best practices. Use when reviewing styling, component markup, or theme configuration.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
---

# Tailwind CSS & shadcn/ui Review

Review the file(s) provided in $ARGUMENTS for Tailwind CSS usage, shadcn/ui component patterns, and styling consistency. Ensure clean, maintainable, and performant styling.

---

## 1. Utility Class Discipline

### 1.1 Use Tailwind utilities, not custom CSS
- Write styles with utility classes. Avoid `style={{}}` inline styles.
- Do not create custom CSS files unless solving a problem utilities cannot handle.
- The exception: CSS variables for design tokens and global resets.

### 1.2 No arbitrary values when a scale value exists
```tsx
// Bad — arbitrary value
<div className="mt-[16px] p-[24px] text-[14px]" />

// Good — scale values
<div className="mt-4 p-6 text-sm" />
```
- Arbitrary values (`[value]`) are acceptable ONLY when no Tailwind scale value matches and the value is a real design decision (e.g. `max-w-[420px]` for a specific layout constraint).

### 1.3 Keep class strings readable
- Order classes logically: layout → sizing → spacing → typography → colors → effects → states.
- Break long class strings across multiple lines for readability.
```tsx
// Bad — chaotic order
<div className="text-sm bg-white rounded-lg flex p-4 mt-2 border shadow-sm items-center gap-2" />

// Good — logical order
<div className="flex items-center gap-2 mt-2 p-4 text-sm bg-white border rounded-lg shadow-sm" />
```

### 1.4 Use `cn()` utility for conditional classes
```tsx
import { cn } from "@/lib/utils";

<button className={cn(
  "px-4 py-2 rounded-md font-medium",
  variant === "primary" && "bg-primary text-primary-foreground",
  variant === "ghost" && "bg-transparent hover:bg-accent",
  disabled && "opacity-50 cursor-not-allowed",
)} />
```

### 1.5 Do not use `@apply` in Tailwind v4
- Tailwind v4 recommends against `@apply`. Use explicit utilities in JSX.
- If repeated, extract into a React component instead of a CSS class.

---

## 2. Design Token Consistency

### 2.1 Use CSS variables, never raw color values
```tsx
// Bad — raw hex colors
<div className="bg-[#1a1a2e] text-[#eee]" />

// Good — semantic tokens
<div className="bg-background text-foreground" />
```

### 2.2 Follow shadcn/ui color convention
- Every color has a `background` + `foreground` pair.
| Token | Usage |
|-------|-------|
| `background` / `foreground` | Page background and default text |
| `card` / `card-foreground` | Card surfaces |
| `primary` / `primary-foreground` | Primary actions |
| `secondary` / `secondary-foreground` | Secondary actions |
| `muted` / `muted-foreground` | Subtle backgrounds and secondary text |
| `accent` / `accent-foreground` | Hover states, highlights |
| `destructive` / `destructive-foreground` | Danger/delete actions |
| `border` | Borders |
| `input` | Input borders |
| `ring` | Focus rings |

### 2.3 Define custom colors through CSS variables
- Extend the theme by adding new CSS variables, not by hardcoding values.
```css
/* In globals.css */
:root {
  --success: 142 71% 45%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
}
```

### 2.4 Use consistent border radius
- Use the `radius` CSS variable defined by shadcn/ui.
- Do not mix `rounded-md`, `rounded-lg`, `rounded-xl` randomly.
- Pick one default radius and use it consistently.

---

## 3. shadcn/ui Component Usage

### 3.1 Use shadcn/ui components as building blocks
- Do not rebuild what shadcn/ui already provides (Dialog, DropdownMenu, Table, etc.).
- Customize by modifying the copied source code in `@repo/ui` or wrapping with additional props.

### 3.2 Compose components, do not override with className sprawl
```tsx
// Bad — fighting the component's styles
<Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 px-10" />

// Good — use variants
<Button variant="default" size="lg" />
```

### 3.3 Create application-specific variants
- Extend shadcn/ui components with custom variants using `cva` (class-variance-authority).
```tsx
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "...",
      destructive: "...",
      success: "bg-success text-success-foreground hover:bg-success/90",
    },
  },
});
```

### 3.4 Keep shadcn/ui component modifications minimal
- When modifying a shadcn/ui component, change only what is necessary.
- Document modifications with a comment at the top of the file.
- This makes it easier to compare with upstream updates.

---

## 4. Responsive Design

### 4.1 Mobile-first with tablet as primary target
- Write base styles for mobile, then scale up.
- Primary breakpoint: `md:` (768px) for tablet.
- Test layouts at: 375px (mobile), 768px (tablet portrait), 1024px (tablet landscape), 1280px (desktop).

### 4.2 Use responsive utility prefixes, not media query CSS
```tsx
// Good — Tailwind responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />

// Bad — custom media queries in CSS
@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }
```

### 4.3 Hide/show elements responsively
```tsx
<MobileNav className="md:hidden" />
<DesktopSidebar className="hidden md:flex" />
```

### 4.4 Responsive typography
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold" />
```

### 4.5 Test touch targets at tablet size
- Buttons and interactive elements must remain at least 44x44px on tablet.
- Use `p-3` or `min-h-11` to ensure sufficient touch area.

---

## 5. Dark Mode

### 5.1 Support dark mode from the start
- Use shadcn/ui's built-in dark mode support via CSS variables.
- Never hardcode light-mode-only colors (`bg-white`, `text-black`).
- Always use semantic tokens that adapt: `bg-background`, `text-foreground`.

### 5.2 Test both themes
- Every component and page must look correct in both light and dark mode.
- Pay attention to borders, shadows, and subtle backgrounds that may disappear in dark mode.

---

## 6. Performance

### 6.1 Avoid overly long class strings
- If a class string exceeds ~10 utilities, consider extracting a component.
- Long class strings are a smell that the element is doing too much.

### 6.2 Use Tailwind's built-in animations sparingly
- `animate-spin`, `animate-pulse`, `animate-bounce` only where meaningful.
- Never animate decorative elements continuously.

### 6.3 Prefer CSS transitions over JS animations
```tsx
// Good — CSS transition
<div className="transition-colors duration-200 hover:bg-accent" />

// Avoid — JS animation libraries for simple state changes
```

---

## 7. Code Organization

### 7.1 Shared UI components live in `@repo/ui`
- Components used across multiple pages belong in the shared package.
- Page-specific components live next to their page file.

### 7.2 Consistent className prop pattern
- Every custom component should accept and merge an optional `className` prop.
```tsx
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

function OrderCard({ className, children }: CardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      {children}
    </div>
  );
}
```

### 7.3 Extract repeated utility patterns into components
```tsx
// Bad — same pattern repeated in 5 files
<div className="flex items-center justify-between p-4 border-b">

// Good — extracted component
<ListRow>
```

---

## Output Format

For each issue found, report:

- **File**: file path and line number
- **Severity**: Critical | Error | Warning | Info
- **Rule**: rule number (e.g. 1.2, 2.1)
- **Issue**: what is wrong
- **Fix**: suggested code change (before/after)

At the end, provide a summary:
- Total issues found (by severity)
- Design token consistency score
- Responsive design coverage
- Top 3 most violated rules
- Overall assessment (Clean / Needs Work / Major Issues)
