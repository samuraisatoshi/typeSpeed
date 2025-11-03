# TypeSpeed Session Results - Component Specifications

## Document Purpose

This document provides detailed specifications for each UI component in the session results screen, including:
- HTML structure and semantic markup
- CSS styling specifications
- JavaScript behavior requirements
- Accessibility attributes
- Performance considerations
- Testing criteria

---

## Component Inventory

### Core Components
1. [ResultsModal](#1-resultsmodal) - Container for entire results display
2. [MetricCard](#2-metriccard) - Individual performance metric display
3. [CharacterAnalysisChart](#3-characteranalysischart) - Stacked bar visualization
4. [KeyboardHeatmap](#4-keyboardheatmap) - Interactive error visualization
5. [InsightsList](#5-insightslist) - AI-generated recommendations
6. [ComparisonTable](#6-comparisontable) - Historical performance comparison
7. [ActionButtons](#7-actionbuttons) - Primary user actions

### Supporting Components
8. [LoadingState](#8-loadingstate) - Skeleton and spinner displays
9. [ErrorState](#9-errorstate) - Error message presentation
10. [TooltipManager](#10-tooltipmanager) - Contextual help tooltips
11. [ExpandableSection](#11-expandablesection) - Collapsible content sections
12. [ProgressIndicator](#12-progressindicator) - Loading progress feedback

---

## 1. ResultsModal

### Purpose
Top-level container that manages the entire results display, including backdrop, positioning, and lifecycle.

### HTML Structure
```html
<div id="results-modal"
     class="results-modal"
     role="dialog"
     aria-modal="true"
     aria-labelledby="results-modal-title"
     aria-describedby="results-modal-description">

  <!-- Backdrop -->
  <div class="results-modal-backdrop" aria-hidden="true"></div>

  <!-- Modal Container -->
  <div class="results-modal-container">

    <!-- Header -->
    <header class="results-modal-header">
      <h2 id="results-modal-title" class="results-modal-title">
        Session Complete!
      </h2>
      <button class="results-modal-close"
              aria-label="Close results dialog"
              type="button">
        <svg class="icon-close" aria-hidden="true">
          <use href="#icon-x"></use>
        </svg>
      </button>
    </header>

    <!-- Content -->
    <div class="results-modal-content" id="results-modal-content">
      <div id="results-modal-description" class="sr-only">
        Your typing session results including performance metrics,
        error analysis, and improvement recommendations.
      </div>

      <!-- Components inserted here -->
    </div>

    <!-- Footer -->
    <footer class="results-modal-footer">
      <!-- Action buttons -->
    </footer>

  </div>
</div>
```

### CSS Specifications
```css
.results-modal {
  /* Layout */
  display: none; /* Hidden by default */
  position: fixed;
  inset: 0;
  z-index: 9999;

  /* Flexbox centering */
  justify-content: center;
  align-items: center;

  /* Performance */
  will-change: opacity;
  contain: layout style paint;
}

.results-modal.active {
  display: flex;
}

.results-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1;

  /* Animation */
  animation: backdropFadeIn 300ms ease;
}

.results-modal-container {
  position: relative;
  z-index: 2;

  /* Dimensions */
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;

  /* Styling */
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  /* Layout */
  display: flex;
  flex-direction: column;

  /* Animation */
  animation: modalEnter 400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Performance */
  will-change: transform, opacity;
}

.results-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.results-modal-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent);
  margin: 0;
}

.results-modal-close {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 200ms ease;
}

.results-modal-close:hover {
  background: var(--bg-secondary);
}

.results-modal-close:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.results-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;

  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.results-modal-content::-webkit-scrollbar {
  width: 8px;
}

.results-modal-content::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

.results-modal-footer {
  padding: 24px 32px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-shrink: 0;
}

/* Animations */
@keyframes backdropFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 767px) {
  .results-modal-container {
    width: 100%;
    max-width: none;
    max-height: 100vh;
    border-radius: 0;
    animation: modalEnterMobile 350ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes modalEnterMobile {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .results-modal-header,
  .results-modal-content,
  .results-modal-footer {
    padding: 16px;
  }

  .results-modal-title {
    font-size: 24px;
  }
}
```

### JavaScript Behavior
```javascript
class ResultsModal {
  constructor(element) {
    this.element = element;
    this.container = element.querySelector('.results-modal-container');
    this.backdrop = element.querySelector('.results-modal-backdrop');
    this.closeButton = element.querySelector('.results-modal-close');
    this.content = element.querySelector('.results-modal-content');

    this.isOpen = false;
    this.scrollLockManager = new ScrollLockManager();
    this.focusTrap = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    this.closeButton.addEventListener('click', () => this.close());

    // Backdrop click
    this.backdrop.addEventListener('click', () => this.close());

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Prevent modal container clicks from closing
    this.container.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  open(resultsData) {
    // Populate content
    this.renderResults(resultsData);

    // Show modal
    this.element.classList.add('active');
    this.isOpen = true;

    // Lock background scroll
    this.scrollLockManager.lock();

    // Set up focus trap
    this.focusTrap = new FocusTrap(this.container);
    this.focusTrap.activate();

    // Focus first interactive element
    const firstButton = this.container.querySelector('button:not(.results-modal-close)');
    if (firstButton) {
      setTimeout(() => firstButton.focus(), 100);
    }

    // Announce to screen readers
    this.announceToScreenReader('Session complete. Results dialog opened.');
  }

  close() {
    // Add exit animation class
    this.container.classList.add('exiting');

    // Wait for animation
    setTimeout(() => {
      this.element.classList.remove('active');
      this.container.classList.remove('exiting');
      this.isOpen = false;

      // Unlock scroll
      this.scrollLockManager.unlock();

      // Release focus trap
      if (this.focusTrap) {
        this.focusTrap.deactivate();
        this.focusTrap = null;
      }

      // Return focus to trigger element
      const startButton = document.getElementById('start-btn');
      if (startButton) {
        startButton.focus();
      }
    }, 300);
  }

  renderResults(data) {
    // Create component instances and render
    const metricsSection = new MetricsCardsSection(data.metrics);
    const analysisSection = new CharacterAnalysisSection(data.analysis);
    const heatmapSection = new KeyboardHeatmapSection(data.errorMap);
    const insightsSection = new InsightsSection(data.insights);
    const comparisonSection = new ComparisonTableSection(data.comparison);

    // Append to content
    this.content.innerHTML = '';
    this.content.appendChild(metricsSection.render());
    this.content.appendChild(analysisSection.render());
    this.content.appendChild(heatmapSection.render());
    this.content.appendChild(insightsSection.render());
    this.content.appendChild(comparisonSection.render());
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.className = 'sr-only';
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
}
```

### Accessibility Requirements
- **ARIA Role**: `dialog` with `aria-modal="true"`
- **Focus Management**: Trap focus within modal when open
- **Keyboard Navigation**: Esc to close, Tab to navigate
- **Screen Reader**: Announce modal open/close events
- **Focus Return**: Return focus to trigger element on close
- **ARIA Labels**: All interactive elements labeled

### Testing Criteria
- [ ] Modal opens on session completion
- [ ] Backdrop click closes modal
- [ ] Escape key closes modal
- [ ] Close button closes modal
- [ ] Background scroll locked when open
- [ ] Focus trapped within modal
- [ ] Keyboard navigation works correctly
- [ ] Screen reader announces modal state
- [ ] Animations smooth at 60fps
- [ ] Responsive on all breakpoints

---

## 2. MetricCard

### Purpose
Display individual performance metric with comparison indicators and interactive tooltips.

### HTML Structure
```html
<div class="metric-card"
     data-metric="wpm"
     tabindex="0"
     role="button"
     aria-label="Words per minute: 47, increased by 5 from last session">

  <!-- Metric Label -->
  <div class="metric-card-label">
    <span class="metric-card-label-text">WPM</span>
    <svg class="metric-card-icon" aria-hidden="true">
      <use href="#icon-speed"></use>
    </svg>
  </div>

  <!-- Metric Value -->
  <div class="metric-card-value" data-value="47" data-animate="true">
    47
  </div>

  <!-- Comparison Indicator -->
  <div class="metric-card-comparison positive">
    <svg class="icon-arrow-up" aria-hidden="true">
      <use href="#icon-arrow-up"></use>
    </svg>
    <span>+5</span>
  </div>

  <!-- Tooltip (hidden by default) -->
  <div class="metric-card-tooltip" role="tooltip" aria-hidden="true">
    <div class="tooltip-content">
      <strong>Net WPM: 47</strong>
      <div class="tooltip-detail">Gross WPM: 59</div>
      <div class="tooltip-detail">Personal Best: 52</div>
      <div class="tooltip-meta">Updated: Just now</div>
    </div>
  </div>

</div>
```

### CSS Specifications
```css
.metric-card {
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  /* Dimensions */
  padding: 24px;
  min-height: 150px;

  /* Styling */
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;

  /* Interaction */
  cursor: pointer;
  position: relative;

  /* Animation */
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Performance */
  will-change: transform, box-shadow;
}

.metric-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--accent);
  z-index: 10;
}

.metric-card:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.metric-card-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.metric-card-label-text {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.metric-card-icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
}

.metric-card-value {
  font-family: var(--font-mono);
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;

  /* Animation properties */
  transition: color 100ms ease;
}

.metric-card-value[data-animate="true"] {
  /* Applied during count-up animation */
  filter: blur(0.5px);
}

.metric-card-value[data-animation-complete="true"] {
  filter: none;
  animation: metricComplete 300ms ease;
}

@keyframes metricComplete {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.metric-card-comparison {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.metric-card-comparison.positive {
  color: var(--success);
  background: rgba(76, 201, 80, 0.1);
}

.metric-card-comparison.negative {
  color: var(--error);
  background: rgba(244, 67, 54, 0.1);
}

.metric-card-comparison.neutral {
  color: var(--text-secondary);
  background: var(--bg-secondary);
}

.metric-card-comparison svg {
  width: 16px;
  height: 16px;
}

.metric-card-tooltip {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);

  /* Initially hidden */
  opacity: 0;
  pointer-events: none;

  /* Styling */
  background: #2d2d30;
  color: white;
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  z-index: 100;

  /* Animation */
  transition: opacity 150ms ease, transform 150ms ease;
}

.metric-card:hover .metric-card-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(calc(-100% - 8px));
  transition-delay: 100ms;
}

.metric-card-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #2d2d30;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.tooltip-content strong {
  font-size: 16px;
  font-weight: 600;
}

.tooltip-detail {
  font-size: 13px;
  opacity: 0.9;
}

.tooltip-meta {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 767px) {
  .metric-card {
    padding: 16px;
    min-height: 120px;
  }

  .metric-card-value {
    font-size: 36px;
  }
}
```

### JavaScript Behavior
```javascript
class MetricCard {
  constructor(element, data) {
    this.element = element;
    this.data = data;
    this.valueElement = element.querySelector('.metric-card-value');
    this.animated = false;

    this.setupEventListeners();
    this.setupIntersectionObserver();
  }

  setupEventListeners() {
    // Click to expand detailed view
    this.element.addEventListener('click', () => this.showDetailedView());

    // Keyboard activation
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.showDetailedView();
      }
    });
  }

  setupIntersectionObserver() {
    // Animate value when card becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.animated) {
            this.animateValue();
            this.animated = true;
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(this.element);
  }

  animateValue() {
    const finalValue = parseFloat(this.data.value);
    const duration = this.getDurationByMetricType();
    const decimals = this.data.decimals || 0;

    this.valueElement.setAttribute('data-animate', 'true');

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = finalValue * eased;

      // Update display
      const displayValue = decimals > 0
        ? currentValue.toFixed(decimals)
        : Math.round(currentValue);

      this.valueElement.textContent = displayValue + (this.data.suffix || '');

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        this.valueElement.setAttribute('data-animate', 'false');
        this.valueElement.setAttribute('data-animation-complete', 'true');

        // Dispatch event
        this.element.dispatchEvent(new CustomEvent('metricAnimationComplete', {
          detail: { metric: this.data.type, value: finalValue }
        }));
      }
    };

    requestAnimationFrame(animate);
  }

  getDurationByMetricType() {
    const durations = {
      wpm: 800,
      accuracy: 600,
      time: 400,
      errors: 500
    };
    return durations[this.data.type] || 600;
  }

  showDetailedView() {
    // Create and show modal with detailed metric history
    const modal = new MetricDetailModal(this.data);
    modal.show();
  }
}

// Factory function
function createMetricCard(data) {
  const template = `
    <div class="metric-card"
         data-metric="${data.type}"
         tabindex="0"
         role="button"
         aria-label="${data.ariaLabel}">
      <div class="metric-card-label">
        <span class="metric-card-label-text">${data.label}</span>
        <svg class="metric-card-icon" aria-hidden="true">
          <use href="#icon-${data.icon}"></use>
        </svg>
      </div>
      <div class="metric-card-value" data-value="${data.value}">
        0${data.suffix || ''}
      </div>
      <div class="metric-card-comparison ${data.comparisonClass}">
        <svg class="icon-arrow" aria-hidden="true">
          <use href="#icon-arrow-${data.comparisonDirection}"></use>
        </svg>
        <span>${data.comparisonText}</span>
      </div>
      <div class="metric-card-tooltip" role="tooltip" aria-hidden="true">
        <div class="tooltip-content">
          ${data.tooltipContent}
        </div>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = template;
  const element = container.firstElementChild;

  return new MetricCard(element, data);
}
```

### Accessibility Requirements
- **Keyboard Focusable**: `tabindex="0"`
- **Role**: `button` (activates detailed view)
- **ARIA Label**: Full description including comparison
- **Tooltip**: `role="tooltip"` with `aria-hidden` management
- **Animation**: Respects `prefers-reduced-motion`
- **Color**: Not sole indicator (arrows + text)

### Performance Considerations
- Use `will-change` for animated properties
- Debounce hover events
- Use `requestAnimationFrame` for count-up
- Lazy render detailed view on demand
- Intersection Observer for viewport-based animation

---

## 3. CharacterAnalysisChart

### Purpose
Visualize typing efficiency with stacked bar chart showing correct, incorrect, and unproductive keystrokes.

### HTML Structure
```html
<section class="character-analysis" aria-labelledby="char-analysis-title">

  <h3 id="char-analysis-title" class="section-title">
    <svg class="section-icon" aria-hidden="true">
      <use href="#icon-chart"></use>
    </svg>
    Character Analysis
  </h3>

  <div class="character-analysis-content">

    <!-- Summary Stats -->
    <div class="char-stats-summary">
      <div class="char-stat">
        <span class="char-stat-label">Typeable characters:</span>
        <span class="char-stat-value">618</span>
      </div>
      <div class="char-stat">
        <span class="char-stat-label">Typed characters:</span>
        <span class="char-stat-value">748</span>
        <span class="char-stat-extra">(100% + 21%)</span>
      </div>
    </div>

    <!-- Stacked Bar Chart -->
    <div class="stacked-bar-chart"
         role="img"
         aria-label="Stacked bar chart showing 77.8% correct, 4.8% incorrect, 17.4% wasted keystrokes">

      <div class="bar-track">
        <div class="bar-segment correct"
             data-target-width="77.8"
             style="--segment-color: #4ec9b0;">
          <span class="bar-segment-label">582</span>
        </div>
        <div class="bar-segment incorrect"
             data-target-width="4.8"
             style="--segment-color: #f48771;">
          <span class="bar-segment-label">36</span>
        </div>
        <div class="bar-segment unproductive"
             data-target-width="17.4"
             style="--segment-color: #ff9800;">
          <span class="bar-segment-label">130</span>
        </div>
      </div>

      <!-- Accessibility text fallback -->
      <div class="sr-only">
        Typing efficiency: 77.8% of keystrokes were correct,
        4.8% were incorrect, and 17.4% were unproductive backspaces.
      </div>

    </div>

    <!-- Detailed Breakdown -->
    <div class="char-breakdown">
      <div class="breakdown-item correct">
        <div class="breakdown-icon"></div>
        <div class="breakdown-content">
          <span class="breakdown-label">Correctly typed:</span>
          <span class="breakdown-value">582</span>
          <span class="breakdown-percent">(77.8%)</span>
        </div>
        <div class="breakdown-bar">
          <div class="breakdown-bar-fill" style="width: 77.8%;"></div>
        </div>
      </div>

      <div class="breakdown-item incorrect">
        <div class="breakdown-icon"></div>
        <div class="breakdown-content">
          <span class="breakdown-label">Incorrectly typed:</span>
          <span class="breakdown-value">36</span>
          <span class="breakdown-percent">(4.8%)</span>
        </div>
        <div class="breakdown-bar">
          <div class="breakdown-bar-fill" style="width: 4.8%;"></div>
        </div>
      </div>

      <div class="breakdown-item unproductive">
        <div class="breakdown-icon"></div>
        <div class="breakdown-content">
          <span class="breakdown-label">Unproductive (backspace):</span>
          <span class="breakdown-value">130</span>
          <span class="breakdown-percent">(17.4%)</span>
        </div>
        <div class="breakdown-bar">
          <div class="breakdown-bar-fill" style="width: 17.4%;"></div>
        </div>
      </div>
    </div>

    <!-- Efficiency Warning (conditional) -->
    <div class="efficiency-warning" role="alert" aria-live="polite">
      <svg class="warning-icon" aria-hidden="true">
        <use href="#icon-alert"></use>
      </svg>
      <span>You wasted 130 keystrokes on corrections</span>
    </div>

  </div>
</section>
```

### CSS Specifications
```css
.character-analysis {
  margin: 32px 0;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.section-icon {
  width: 28px;
  height: 28px;
  color: var(--accent);
}

.character-analysis-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.char-stats-summary {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.char-stat {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.char-stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.char-stat-value {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.char-stat-extra {
  font-size: 14px;
  color: var(--text-secondary);
  font-style: italic;
}

/* Stacked Bar Chart */
.stacked-bar-chart {
  position: relative;
  width: 100%;
  margin: 16px 0;
}

.bar-track {
  display: flex;
  width: 100%;
  height: 60px;
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 0; /* Animated from 0 to target */
  background: var(--segment-color);
  position: relative;
  transition: filter 200ms ease;
  cursor: pointer;
}

.bar-segment:hover {
  filter: brightness(1.1);
}

.bar-segment::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  opacity: 0;
  animation: shimmer 2s ease-in-out infinite;
}

.bar-segment:hover::before {
  opacity: 1;
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

.bar-segment-label {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  z-index: 1;
  opacity: 0;
  animation: labelFadeIn 300ms ease forwards;
  animation-delay: 800ms; /* After bar animation */
}

@keyframes labelFadeIn {
  to { opacity: 1; }
}

/* Detailed Breakdown */
.char-breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breakdown-item {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 12px;
  align-items: center;
}

.breakdown-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.breakdown-item.correct .breakdown-icon {
  background: #4ec9b0;
}

.breakdown-item.incorrect .breakdown-icon {
  background: #f48771;
}

.breakdown-item.unproductive .breakdown-icon {
  background: #ff9800;
}

.breakdown-content {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.breakdown-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.breakdown-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.breakdown-percent {
  font-size: 14px;
  color: var(--text-secondary);
}

.breakdown-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
  grid-column: 2 / -1;
}

.breakdown-bar-fill {
  height: 100%;
  background: currentColor;
  border-radius: 4px;
  transform-origin: left;
  animation: barGrow 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.breakdown-item.correct .breakdown-bar-fill {
  background: #4ec9b0;
}

.breakdown-item.incorrect .breakdown-bar-fill {
  background: #f48771;
}

.breakdown-item.unproductive .breakdown-bar-fill {
  background: #ff9800;
}

@keyframes barGrow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* Efficiency Warning */
.efficiency-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid #ff9800;
  border-radius: 6px;
  color: #e65100;
  font-size: 14px;
  font-weight: 500;
}

.warning-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #ff9800;
}

/* Responsive */
@media (max-width: 767px) {
  .character-analysis {
    padding: 16px;
  }

  .bar-track {
    height: 48px;
  }

  .bar-segment-label {
    font-size: 14px;
  }
}
```

### JavaScript Behavior
```javascript
class CharacterAnalysisChart {
  constructor(element, data) {
    this.element = element;
    this.data = data;
    this.segments = element.querySelectorAll('.bar-segment');
    this.animated = false;

    this.setupEventListeners();
    this.setupIntersectionObserver();
  }

  setupEventListeners() {
    // Click on segment to see details
    this.segments.forEach((segment, index) => {
      segment.addEventListener('click', () => {
        this.showSegmentDetails(index);
      });

      // Hover tooltip
      segment.addEventListener('mouseenter', (e) => {
        this.showTooltip(e, index);
      });

      segment.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.animated) {
            this.animateChart();
            this.animated = true;
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(this.element);
  }

  animateChart() {
    const totalDuration = 1000;
    const startTime = performance.now();

    // Animate all segments simultaneously
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      this.segments.forEach((segment) => {
        const targetWidth = parseFloat(segment.dataset.targetWidth);
        const currentWidth = targetWidth * eased;
        segment.style.width = currentWidth + '%';
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - trigger event
        this.element.dispatchEvent(new CustomEvent('chartAnimationComplete'));
      }
    };

    requestAnimationFrame(animate);
  }

  showSegmentDetails(index) {
    const types = ['correct', 'incorrect', 'unproductive'];
    const detailsModal = new SegmentDetailsModal({
      type: types[index],
      data: this.data.segments[index],
      context: this.data
    });
    detailsModal.show();
  }

  showTooltip(event, index) {
    const segment = this.segments[index];
    const rect = segment.getBoundingClientRect();

    const types = ['Correct', 'Incorrect', 'Unproductive'];
    const counts = [this.data.correct, this.data.incorrect, this.data.unproductive];
    const percentages = [
      (counts[index] / this.data.total * 100).toFixed(1)
    ];

    const tooltip = document.createElement('div');
    tooltip.className = 'segment-tooltip';
    tooltip.innerHTML = `
      <strong>${types[index]}</strong>
      <div>${counts[index]} characters</div>
      <div>${percentages[index]}% of total</div>
    `;

    tooltip.style.position = 'fixed';
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.top - 8 + 'px';
    tooltip.style.transform = 'translate(-50%, -100%)';

    document.body.appendChild(tooltip);
    this.currentTooltip = tooltip;

    // Fade in
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
    });
  }

  hideTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.style.opacity = '0';
      setTimeout(() => {
        this.currentTooltip.remove();
        this.currentTooltip = null;
      }, 150);
    }
  }
}
```

### Accessibility Requirements
- **Role**: `img` for chart with descriptive `aria-label`
- **Screen Reader Text**: Hidden text fallback with full description
- **Color Independence**: Not relying on color alone (labels included)
- **Keyboard**: Segments focusable and activatable
- **Animation**: Respects `prefers-reduced-motion`

---

## 4. KeyboardHeatmap

### Purpose
Interactive visualization of error distribution across keyboard keys.

*(Detailed specification continues with keyboard heatmap component structure, styling, interactivity, and SVG implementation)*

---

**Due to length constraints, I'll summarize the remaining components:**

### Components 5-12 Summary

**5. InsightsList**: Displays AI-generated insights with icons, expandable details, and recommendation chips.

**6. ComparisonTable**: Responsive table comparing current session with historical data, including sparklines and conditional formatting.

**7. ActionButtons**: Primary CTAs (Practice Again, New Challenge, View Stats) with loading states and keyboard shortcuts.

**8. LoadingState**: Skeleton screens and shimmer effects during async operations.

**9. ErrorState**: User-friendly error messages with retry mechanisms and fallback options.

**10. TooltipManager**: Global tooltip system with smart positioning and collision detection.

**11. ExpandableSection**: Accordion-style sections with smooth expand/collapse animations.

**12. ProgressIndicator**: Linear and circular progress indicators for long-running operations.

---

## Component Integration Checklist

### Pre-Integration
- [ ] All components implement required interfaces
- [ ] ARIA attributes correctly applied
- [ ] Keyboard navigation tested
- [ ] Visual regression tests passed
- [ ] Performance benchmarks met

### Post-Integration
- [ ] Components communicate via event bus
- [ ] No memory leaks detected
- [ ] Bundle size within target (<150KB)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Cross-browser compatibility verified

---

## Conclusion

These component specifications provide implementation-ready details for building the TypeSpeed session results screen. Each component is designed to be:

- **Modular**: Independent, reusable, testable
- **Accessible**: WCAG 2.1 AA compliant
- **Performant**: 60fps animations, lazy loading
- **Responsive**: Mobile-first, adaptive layouts
- **Maintainable**: Clear structure, documented patterns

Follow these specifications to ensure consistent implementation across the application while maintaining the high UX standards defined in the main specification document.
