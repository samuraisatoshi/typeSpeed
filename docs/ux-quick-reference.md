# TypeSpeed Session Results - Quick Reference Guide

## For Developers Implementing the Enhanced Results Screen

This quick reference provides at-a-glance information for implementing the session results UX improvements.

---

## Document Suite

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **ux-specification-session-results.md** | Complete UX specification | Understanding user flows, visual design, requirements |
| **ux-interaction-patterns.md** | Detailed interaction specs | Implementing animations, gestures, micro-interactions |
| **ux-component-specifications.md** | Component HTML/CSS/JS details | Building individual components |
| **ux-implementation-roadmap.md** | Phased development plan | Project planning, task breakdown, estimates |
| **ux-quick-reference.md** (this) | Quick lookup guide | Fast answers during development |

---

## Component Quick Reference

### Core Components (Phase 1-3)

| Component | Priority | Complexity | Estimated Days | Key Files |
|-----------|----------|------------|----------------|-----------|
| ResultsModal | P0 | Medium | 2-3 | `ResultsModal.js`, `results-modal.css` |
| MetricCard | P0 | Low | 1-2 | `MetricCard.js`, `metric-card.css` |
| MetricsCardsGrid | P0 | Low | 1 | `MetricsCardsGrid.js`, `metrics-grid.css` |
| CharacterAnalysisChart | P1 | Medium | 2-3 | `CharacterAnalysisChart.js`, `character-analysis.css` |
| KeyboardHeatmap | P1 | High | 4-5 | `KeyboardHeatmap.js`, `keyboard-heatmap.css` |
| InsightsList | P1 | Medium | 2-3 | `InsightsList.js`, `insights-section.css` |
| ComparisonTable | P1 | Medium | 2-3 | `ComparisonTable.js`, `comparison-table.css` |
| TouchTypingGuide | P2 | Medium | 3-4 | `TouchTypingGuide.js`, `typing-guide.css` |

---

## Animation Timing Reference

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Modal entrance (desktop) | 400ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Session complete |
| Modal entrance (mobile) | 350ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Session complete |
| Metric card reveal | 300ms | `ease` | Viewport enter |
| Number count-up (WPM) | 800ms | Ease-out cubic | Card visible |
| Number count-up (%) | 600ms | Ease-out cubic | Card visible |
| Bar chart growth | 1000ms | Ease-out cubic | Chart visible |
| Keyboard heatmap fade | 500ms | `ease` | Section visible |
| Hover elevation | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Mouse enter |
| Tooltip appear | 150ms | `ease` | Hover 100ms delay |
| Section expand | 400ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Click header |

**General Rules**:
- Use `cubic-bezier(0.4, 0, 0.2, 1)` for entrance animations
- Use ease-out cubic for count-up/growth animations
- Delay tooltip by 100ms to avoid flicker
- Respect `prefers-reduced-motion` media query

---

## Color Palette

### Semantic Colors

```css
/* Light Mode */
--bg-primary: #ffffff;
--bg-secondary: #f5f5f5;
--text-primary: #333333;
--text-secondary: #666666;
--border: #e0e0e0;
--accent: #007acc;

/* Status Colors */
--success: #4caf50;
--error: #f44336;
--warning: #ff9800;
--info: #2196f3;

/* Dark Mode */
--bg-primary-dark: #1e1e1e;
--bg-secondary-dark: #2d2d30;
--text-primary-dark: #cccccc;
--text-secondary-dark: #999999;
--border-dark: #3e3e42;
```

### Error Heatmap Colors

```css
/* Error frequency scale */
--heatmap-green: #4caf50;   /* 0-2 errors */
--heatmap-yellow: #ffeb3b;  /* 3-5 errors */
--heatmap-orange: #ff9800;  /* 6-9 errors */
--heatmap-red: #f44336;     /* 10+ errors */
--heatmap-gray: #e0e0e0;    /* Not used */
```

### Character Analysis Colors

```css
--char-correct: #4ec9b0;      /* Correctly typed */
--char-incorrect: #f48771;    /* Incorrectly typed */
--char-unproductive: #ff9800; /* Backspaces/waste */
```

---

## Spacing System

```css
/* Base unit: 8px */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;

/* Common usage */
padding: var(--space-lg);        /* Card padding */
gap: var(--space-md);            /* Grid gap */
margin-bottom: var(--space-xl);  /* Section spacing */
```

---

## Typography Scale

```css
/* Font families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;

/* Font sizes */
--text-xs: 12px;    /* 0.75rem */
--text-sm: 14px;    /* 0.875rem */
--text-base: 16px;  /* 1rem */
--text-lg: 18px;    /* 1.125rem */
--text-xl: 20px;    /* 1.25rem */
--text-2xl: 24px;   /* 1.5rem */
--text-3xl: 32px;   /* 2rem */
--text-4xl: 48px;   /* 3rem */

/* Font weights */
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;

/* Line heights */
--leading-tight: 1.2;
--leading-normal: 1.6;
--leading-loose: 2.0;
```

---

## Responsive Breakpoints

```css
/* Mobile small */
@media (max-width: 375px) { }

/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1199px) { }

/* Desktop */
@media (min-width: 1200px) { }
```

**Common Patterns**:
```css
/* Mobile-first approach */
.component {
  /* Mobile styles (default) */
  display: block;
}

@media (min-width: 768px) {
  .component {
    /* Tablet enhancements */
    display: flex;
  }
}

@media (min-width: 1200px) {
  .component {
    /* Desktop enhancements */
    max-width: 1200px;
  }
}
```

---

## Accessibility Quick Checks

### Must-Have ARIA Attributes

```html
<!-- Modal -->
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">Modal Title</h2>
</div>

<!-- Button -->
<button aria-label="Close dialog">×</button>

<!-- Tooltip -->
<div role="tooltip" aria-hidden="true">Tooltip text</div>

<!-- Status/Alert -->
<div role="status" aria-live="polite">Update message</div>

<!-- Chart/Visualization -->
<div role="img" aria-label="Chart description">
  <svg>...</svg>
  <div class="sr-only">Text fallback for screen readers</div>
</div>
```

### Keyboard Navigation

| Element | Key | Action |
|---------|-----|--------|
| Modal | `Esc` | Close modal |
| Focusable | `Tab` | Next element |
| Focusable | `Shift+Tab` | Previous element |
| Button | `Enter` or `Space` | Activate |
| Section | `Enter` | Expand/collapse |
| Keyboard keys | Arrow keys | Navigate |

### Focus Management

```javascript
// Trap focus within modal
class FocusTrap {
  constructor(element) {
    this.element = element;
    this.focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this.firstElement = this.focusableElements[0];
    this.lastElement = this.focusableElements[this.focusableElements.length - 1];
  }

  activate() {
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.firstElement.focus();
  }

  handleKeyDown(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift+Tab
      if (document.activeElement === this.firstElement) {
        e.preventDefault();
        this.lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastElement) {
        e.preventDefault();
        this.firstElement.focus();
      }
    }
  }
}
```

---

## Performance Optimization

### CSS Performance

```css
/* Use transforms for animations (GPU-accelerated) */
.animated {
  transform: translateY(20px); /* Good */
  /* top: 20px; */ /* Bad - causes reflow */
}

/* Use will-change for elements about to animate */
.will-animate {
  will-change: transform, opacity;
}

/* Remove will-change after animation */
.animated-complete {
  will-change: auto;
}

/* Use contain for independent components */
.component {
  contain: layout style paint;
}
```

### JavaScript Performance

```javascript
// Use requestAnimationFrame for animations
function animate() {
  // Update DOM
  element.style.transform = `translateX(${x}px)`;

  if (animating) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);

// Debounce hover events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const handleHover = debounce((e) => {
  // Handle hover
}, 16); // 60fps = ~16ms

// Use IntersectionObserver for viewport detection
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is visible - trigger animation
    }
  });
}, { threshold: 0.5 });

observer.observe(element);
```

### Bundle Size

```javascript
// Lazy load non-critical components
const KeyboardHeatmap = () => import('./KeyboardHeatmap.js');

// Use dynamic imports
button.addEventListener('click', async () => {
  const { default: Modal } = await import('./Modal.js');
  const modal = new Modal();
  modal.show();
});
```

---

## Common Patterns

### Number Count-Up Animation

```javascript
function animateValue(element, finalValue, duration, decimals = 0) {
  const startValue = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (finalValue - startValue) * eased;

    element.textContent = decimals > 0
      ? currentValue.toFixed(decimals)
      : Math.round(currentValue);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Usage
animateValue(wpmElement, 47, 800, 0);
animateValue(accuracyElement, 94.2, 600, 1);
```

### Stacked Bar Animation

```javascript
function animateStackedBar(segments) {
  const duration = 1000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    segments.forEach(segment => {
      const targetWidth = parseFloat(segment.dataset.targetWidth);
      segment.style.width = (targetWidth * eased) + '%';
    });

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
```

### Tooltip Management

```javascript
class Tooltip {
  show(targetElement, content) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.innerHTML = content;

    document.body.appendChild(tooltip);

    // Position above target
    const targetRect = targetElement.getBoundingClientRect();
    tooltip.style.left = targetRect.left + targetRect.width / 2 + 'px';
    tooltip.style.top = targetRect.top - 8 + 'px';
    tooltip.style.transform = 'translate(-50%, -100%)';

    // Fade in
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
    });

    return tooltip;
  }

  hide(tooltip) {
    tooltip.style.opacity = '0';
    setTimeout(() => tooltip.remove(), 150);
  }
}
```

---

## Testing Checklist

### Unit Tests

```javascript
// Example test structure
describe('MetricCard', () => {
  test('renders with correct value', () => {
    const card = new MetricCard({ value: 47, label: 'WPM' });
    expect(card.element.querySelector('.metric-card-value').textContent).toBe('47');
  });

  test('animates value on viewport entry', async () => {
    const card = new MetricCard({ value: 47, label: 'WPM' });
    // Simulate viewport entry
    await card.animateValue();
    expect(card.animated).toBe(true);
  });

  test('displays comparison indicator', () => {
    const card = new MetricCard({
      value: 47,
      comparison: { lastValue: 42, change: 5 }
    });
    expect(card.element.querySelector('.metric-card-comparison')).toBeTruthy();
  });
});
```

### Component Tests

```javascript
// Example Playwright test
test('results modal displays after session completion', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Complete a session
  await page.fill('#folder-input', '/path/to/project');
  await page.click('#scan-btn');
  await page.click('#start-btn');

  // Type the entire code snippet
  // ... typing logic ...

  // Wait for modal to appear
  const modal = page.locator('#results-modal.active');
  await expect(modal).toBeVisible({ timeout: 3000 });

  // Check metrics are displayed
  const wpmValue = page.locator('.metric-card[data-metric="wpm"] .metric-card-value');
  await expect(wpmValue).toContainText(/\d+/);
});
```

### Accessibility Tests

```javascript
// Example axe test
import { injectAxe, checkA11y } from 'axe-playwright';

test('results modal is accessible', async ({ page }) => {
  await page.goto('http://localhost:3000/results');
  await injectAxe(page);

  await checkA11y(page, '#results-modal', {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
});
```

---

## API Data Structures

### Session Completion Response

```typescript
interface SessionCompletionResponse {
  sessionId: string;
  userId: string;
  duration: number; // milliseconds
  completedAt: string; // ISO timestamp

  metrics: {
    netWPM: number;
    grossWPM: number;
    accuracy: number; // 0-100
    errorRate: number; // 0-100
    consistency: number; // 0-1
    totalCharacters: number;
    typedCharacters: number;
    correctChars: number;
    incorrectChars: number;
    backspaces: number;
  };

  errorMap: {
    [key: string]: {
      count: number;
      mistypedAs: { [char: string]: number };
      avgCorrectionTime: number;
      occurrences: Array<{
        position: number;
        line: number;
        context: string;
      }>;
    };
  };

  linePerformance: Array<{
    line: number;
    wpm: number;
    accuracy: number;
    duration: number;
  }>;

  insights: Array<{
    type: 'performance' | 'error' | 'tip' | 'motivation';
    priority: number;
    message: string;
    details?: string;
    actionable?: string;
  }>;

  comparison: {
    lastSession: SessionMetrics;
    average10: SessionMetrics;
    personalBest: SessionMetrics;
  };
}

interface SessionMetrics {
  wpm: number;
  accuracy: number;
  duration: number;
  date?: string;
}
```

---

## Debugging Tips

### Common Issues

**Issue**: Animations not smooth
- Check frame rate with Chrome DevTools Performance
- Use `will-change` on animated properties
- Ensure using `transform` instead of `left`/`top`
- Reduce number of simultaneous animations

**Issue**: Modal doesn't trap focus
- Verify `role="dialog"` and `aria-modal="true"`
- Check focus trap implementation
- Ensure first focusable element receives focus on open
- Test with Tab and Shift+Tab

**Issue**: Keyboard heatmap renders slowly
- Use single SVG instead of individual DOM nodes
- Precompute color mappings
- Lazy load detailed data on hover
- Consider virtualization for large keyboards

**Issue**: Numbers don't count up
- Check IntersectionObserver threshold
- Verify element is in viewport when triggered
- Ensure `requestAnimationFrame` is being called
- Check for JavaScript errors in console

### Performance Profiling

```javascript
// Measure component render time
console.time('Component Render');
const component = new MetricCard(data);
component.render();
console.timeEnd('Component Render');
// Goal: <16ms for 60fps

// Measure animation frame rate
let frameCount = 0;
let lastTime = performance.now();

function measureFPS() {
  frameCount++;
  const currentTime = performance.now();

  if (currentTime >= lastTime + 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(measureFPS);
}
measureFPS();
```

---

## Resources & Links

### Internal Documentation
- Main Spec: [`ux-specification-session-results.md`](./ux-specification-session-results.md)
- Interactions: [`ux-interaction-patterns.md`](./ux-interaction-patterns.md)
- Components: [`ux-component-specifications.md`](./ux-component-specifications.md)
- Roadmap: [`ux-implementation-roadmap.md`](./ux-implementation-roadmap.md)

### External Resources
- [MDN Web Docs](https://developer.mozilla.org/)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web.dev Performance](https://web.dev/performance/)
- [CSS Tricks](https://css-tricks.com/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Debugging
- [Playwright](https://playwright.dev/) - E2E testing

---

## Quick Start Guide

### Setting Up Development Environment

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Check accessibility**:
   ```bash
   npm run a11y
   ```

### Creating a New Component

1. **Create component file**:
   ```javascript
   // public/js/presentation/MyComponent.js
   class MyComponent {
     constructor(element, data) {
       this.element = element;
       this.data = data;
       this.setupEventListeners();
     }

     setupEventListeners() {
       // Add event listeners
     }

     render() {
       // Return DOM element
     }
   }
   ```

2. **Create CSS file**:
   ```css
   /* public/css/components/my-component.css */
   .my-component {
     /* Component styles */
   }
   ```

3. **Add to HTML**:
   ```html
   <script src="js/presentation/MyComponent.js"></script>
   <link rel="stylesheet" href="css/components/my-component.css">
   ```

4. **Write tests**:
   ```javascript
   // tests/MyComponent.test.js
   describe('MyComponent', () => {
     test('renders correctly', () => {
       // Test implementation
     });
   });
   ```

---

## Support & Questions

If you have questions while implementing:

1. Check this quick reference first
2. Consult the detailed specification documents
3. Review code examples in `/public/js/presentation/`
4. Ask in team chat or open an issue
5. Schedule pairing session for complex features

**Remember**: The goal is to create an accessible, performant, and delightful user experience. When in doubt, prioritize user needs over implementation convenience.

---

*Last Updated: 2025-11-03*
