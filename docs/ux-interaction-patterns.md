# TypeSpeed Session Results - Interaction Patterns & User Flows

## Document Purpose

This companion document to the main UX specification provides detailed interaction patterns, state diagrams, and micro-interaction specifications for the TypeSpeed session results screen.

---

## Table of Contents

1. [User Flow Diagrams](#user-flow-diagrams)
2. [State Machine Definitions](#state-machine-definitions)
3. [Micro-interaction Specifications](#micro-interaction-specifications)
4. [Gesture & Input Patterns](#gesture--input-patterns)
5. [Data Visualization Guidelines](#data-visualization-guidelines)
6. [Modal Behavior Patterns](#modal-behavior-patterns)
7. [Responsive Breakpoint Behaviors](#responsive-breakpoint-behaviors)
8. [Error & Edge Case Flows](#error--edge-case-flows)

---

## User Flow Diagrams

### Primary Flow: Session Completion to Next Action

```
┌──────────────────┐
│  User Types      │
│  Final Character │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Validate         │  ◄────── Is position === total length?
│ Completion       │          Yes → Continue
└────────┬─────────┘          No  → Return to typing
         │
         ▼
┌──────────────────┐
│ Freeze Interface │  ◄────── Prevent further input
│ Show Overlay     │          Display "Finalizing..."
└────────┬─────────┘          Duration: 100-200ms
         │
         ▼
┌──────────────────┐
│ Calculate        │  ◄────── Backend API call
│ Metrics          │          POST /api/session/:id/complete
└────────┬─────────┘          Timeout: 3s max
         │
         ├─── Success ─────────────────┐
         │                             │
         │                             ▼
         │                    ┌──────────────────┐
         │                    │ Generate         │
         │                    │ Visualizations   │
         │                    └────────┬─────────┘
         │                             │
         │                             ▼
         │                    ┌──────────────────┐
         │                    │ Build Insights   │
         │                    │ & Recommendations│
         │                    └────────┬─────────┘
         │                             │
         │◄────────────────────────────┘
         │
         ▼
┌──────────────────┐
│ Render Results   │  ◄────── Modal entrance animation
│ Modal (Stage 1)  │          Show primary metrics
└────────┬─────────┘          Duration: 400ms
         │
         │ [300ms delay]
         ▼
┌──────────────────┐
│ Reveal Character │  ◄────── Slide-in animation
│ Analysis         │          Grow bar chart
└────────┬─────────┘          Duration: 600ms
         │
         │ [300ms delay]
         ▼
┌──────────────────┐
│ Display Keyboard │  ◄────── Fade-in heatmap
│ Heatmap          │          Render colored keys
└────────┬─────────┘          Duration: 500ms
         │
         │ [300ms delay]
         ▼
┌──────────────────┐
│ Show Insights    │  ◄────── Fade-in insights
│ & Comparison     │          Display recommendations
└────────┬─────────┘          Duration: 300ms
         │
         ▼
┌──────────────────────────────────────────┐
│  User Interaction Phase                  │
│  ────────────────────────────────────    │
│  • Hover over metrics for details        │
│  • Click keyboard keys for error context │
│  • Expand/collapse sections              │
│  • Read insights and recommendations     │
│                                           │
│  Typical duration: 30-90 seconds         │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  User Selects Action:            │
│  ┌──────────────────────────┐    │
│  │ A. Practice Again        │────┼──► Start new session (same config)
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ B. New Challenge         │────┼──► Configure new session
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ C. View All Stats        │────┼──► Navigate to statistics view
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ D. Share Results         │────┼──► Generate shareable link
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ E. Close [X]             │────┼──► Return to practice view
│  └──────────────────────────┘    │
└───────────────────────────────────┘


Error Handling Flow:
├─── API Timeout/Error ───────────────┐
│                                      │
│                                      ▼
│                             ┌──────────────────┐
│                             │ Show Partial     │
│                             │ Results (cached) │
│                             └────────┬─────────┘
│                                      │
│                                      ▼
│                             ┌──────────────────┐
│                             │ Display Error    │
│                             │ Message + Retry  │
│                             └──────────────────┘
│
└─── Network Error ───────────────────┐
                                      │
                                      ▼
                             ┌──────────────────┐
                             │ Save to          │
                             │ localStorage     │
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │ Show Basic       │
                             │ Results Offline  │
                             └──────────────────┘
```

---

## State Machine Definitions

### Results Modal State Machine

```
States:
  - IDLE: No modal active
  - LOADING: Calculating metrics
  - RENDERING: Building UI
  - INTERACTIVE: User exploring results
  - EXITING: Closing modal
  - ERROR: Error state

Transitions:

IDLE ──[session_complete]──> LOADING
  Conditions: currentPosition === totalCharacters && sessionActive === true
  Actions:
    - Freeze typing interface
    - Show overlay with spinner
    - Start API request
    - Set timeout (3s)

LOADING ──[metrics_calculated]──> RENDERING
  Conditions: API response received && response.ok === true
  Actions:
    - Hide spinner
    - Parse response data
    - Build data structures for visualizations
    - Trigger entrance animation

LOADING ──[timeout_or_error]──> ERROR
  Conditions: API timeout >3s OR response.ok === false
  Actions:
    - Log error details
    - Check localStorage for cached data
    - Display error message
    - Offer retry option

RENDERING ──[ui_ready]──> INTERACTIVE
  Conditions: All critical DOM elements rendered
  Actions:
    - Enable user interactions
    - Start staged reveal animations
    - Initialize event listeners
    - Focus first interactive element

INTERACTIVE ──[user_action: practice_again]──> EXITING
  Actions:
    - Save "practice again" preference
    - Start exit animation
    - Prepare new session config
    - Clean up event listeners

INTERACTIVE ──[user_action: close]──> EXITING
  Actions:
    - Start exit animation
    - Clean up event listeners
    - Reset UI state

EXITING ──[animation_complete]──> IDLE
  Conditions: Exit animation finished
  Actions:
    - Remove modal from DOM
    - Reset state variables
    - Execute queued action (new session, navigate, etc.)

ERROR ──[user_action: retry]──> LOADING
  Actions:
    - Clear error state
    - Retry API request
    - Show loading indicator

ERROR ──[user_action: close]──> EXITING
  Actions:
    - Log dismissal
    - Start exit animation


State Properties:

LOADING:
  - showSpinner: true
  - allowInteraction: false
  - apiRequestActive: true
  - progressPercentage: 0-100

RENDERING:
  - showSpinner: false
  - allowInteraction: false
  - stageIndex: 0-4 (metrics, analysis, heatmap, insights, comparison)
  - animationProgress: 0-100

INTERACTIVE:
  - allowInteraction: true
  - expandedSections: Set<string>
  - hoveredElement: HTMLElement | null
  - tooltipVisible: boolean

ERROR:
  - errorMessage: string
  - errorType: 'network' | 'timeout' | 'calculation' | 'unknown'
  - retryCount: number
  - fallbackDataAvailable: boolean
```

---

## Micro-interaction Specifications

### 1. Metric Card Hover

**Trigger**: Mouse enters metric card boundary

**Duration**: 200ms

**Easing**: cubic-bezier(0.4, 0, 0.2, 1)

**Effects**:
```css
/* Initial state */
.metric-card {
  transform: translateY(0) scale(1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover state */
.metric-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  border: 1px solid #007acc;
  z-index: 10;
}

/* Tooltip appearance */
.metric-card:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 150ms ease 100ms,
              transform 150ms ease 100ms;
}

.metric-card .tooltip {
  opacity: 0;
  transform: translateY(4px);
}
```

**Behavior**:
1. Card elevates 4px with shadow increase
2. Border color changes to accent blue
3. After 100ms delay, tooltip fades in above card
4. Tooltip contains:
   - Detailed metric breakdown
   - Comparison context
   - Last updated timestamp

**Exit Behavior**:
- On mouse leave, reverse all effects
- No delay on exit for immediate response
- Tooltip fades out instantly (no delay)

---

### 2. Number Count-Up Animation

**Trigger**: Metric card becomes visible in viewport

**Duration**: 800ms (WPM), 600ms (percentages), 400ms (time)

**Easing**: Ease-out cubic for natural deceleration

**Implementation**:
```javascript
function animateMetricValue(element, finalValue, duration, decimals = 0) {
  const startValue = 0;
  const startTime = performance.now();
  const isPercentage = element.dataset.type === 'percentage';
  const suffix = isPercentage ? '%' : '';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic: 1 - (1 - t)^3
    const eased = 1 - Math.pow(1 - progress, 3);

    const currentValue = startValue + (finalValue - startValue) * eased;
    const displayValue = decimals > 0
      ? currentValue.toFixed(decimals)
      : Math.round(currentValue);

    element.textContent = displayValue + suffix;

    // Add visual feedback at milestones
    if (progress >= 0.5 && !element.dataset.halfwayReached) {
      element.dataset.halfwayReached = 'true';
      element.style.color = '#007acc'; // Brief accent color
      setTimeout(() => {
        element.style.color = '';
      }, 100);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // Final value set, trigger completion callback
      element.dispatchEvent(new CustomEvent('animationComplete', {
        detail: { value: finalValue }
      }));
    }
  }

  requestAnimationFrame(update);
}

// Usage:
animateMetricValue(wpmElement, 47, 800, 0);
animateMetricValue(accuracyElement, 94.2, 600, 1);
```

**Visual Enhancements**:
- Numbers blur slightly during rapid counting (motion blur effect)
- Brief accent color flash at 50% completion
- Subtle scale pulse (1.0 → 1.05 → 1.0) when complete
- Font weight increases slightly when animation completes

---

### 3. Keyboard Key Hover & Click

**Hover Behavior**:

**Trigger**: Mouse enters key boundary

**Duration**: 150ms

**Effects**:
```css
.keyboard-key {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  transition: all 150ms ease;
  cursor: pointer;
}

/* Error color states */
.keyboard-key.error-low { background: #4caf50; }
.keyboard-key.error-medium { background: #ffeb3b; }
.keyboard-key.error-high { background: #ff9800; }
.keyboard-key.error-critical { background: #f44336; color: white; }

/* Hover state */
.keyboard-key:hover {
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  z-index: 100;
  filter: brightness(1.1);
}

/* Tooltip */
.keyboard-key:hover .key-tooltip {
  opacity: 1;
  transform: translateY(-8px);
  pointer-events: none;
}

.key-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: #2d2d30;
  color: white;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 150ms ease, transform 150ms ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* Tooltip arrow */
.key-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #2d2d30;
}
```

**Tooltip Content Structure**:
```
┌─────────────────────────────┐
│ Key: [                      │
│ Errors: 12                  │
│ ────────────────────        │
│ Typed ] instead: 8 times    │
│ Typed ; instead: 3 times    │
│ Typed p instead: 1 time     │
│ ────────────────────        │
│ Avg correction time: 1.2s   │
│ 💡 Tip: Practice brackets   │
└─────────────────────────────┘
```

**Click Behavior**:

**Trigger**: Click on keyboard key

**Action**: Open detailed analysis modal

**Modal Content**:
```
╔═══════════════════════════════════════╗
║  Key Analysis: [                      ║
╠═══════════════════════════════════════╣
║                                       ║
║  📊 Error Summary                     ║
║  Total errors: 12                     ║
║  Error rate: 19% (12 of 63 attempts)  ║
║                                       ║
║  ─────────────────────────────────    ║
║                                       ║
║  🔍 Error Breakdown                   ║
║  ┌─────────────────────────────────┐  ║
║  │ What you typed  │  Times  │  %  │  ║
║  ├─────────────────┼─────────┼─────┤  ║
║  │ ]               │    8    │ 67% │  ║
║  │ ;               │    3    │ 25% │  ║
║  │ p               │    1    │  8% │  ║
║  └─────────────────┴─────────┴─────┘  ║
║                                       ║
║  ─────────────────────────────────    ║
║                                       ║
║  📍 When Errors Occurred              ║
║  ┌─────────────────────────────────┐  ║
║  │ Line 12: if (arr[index] === ...) │ ──┐
║  │ Line 15: const map = new Map()   │   │ Click to
║  │ Line 23: return obj[key] || ...  │   │ view code
║  │ ...and 9 more                    │ ──┘ context
║  └─────────────────────────────────┘  ║
║                                       ║
║  ─────────────────────────────────    ║
║                                       ║
║  💡 Improvement Tips                  ║
║  • This key is typed with right       ║
║    pinky finger                       ║
║  • Practice these combinations:       ║
║    [[  ][  []  [[[  ]]]              ║
║  • Common in: Array access, objects   ║
║                                       ║
║  [Practice This Key]  [Close]         ║
║                                       ║
╚═══════════════════════════════════════╝
```

**Press Animation**:
```css
.keyboard-key:active {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: all 50ms ease;
}
```

---

### 4. Bar Chart Growth Animation

**Trigger**: Character analysis section enters viewport

**Duration**: 1000ms

**Behavior**:

**Stage 1: Bar Container Fade-In (0-200ms)**
```css
@keyframes barContainerFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Stage 2: Bar Segments Grow (200-1000ms)**
```javascript
function animateBarChart(segments) {
  const totalDuration = 800;
  const startTime = performance.now();

  segments.forEach((segment, index) => {
    const delay = index * 50; // Stagger by 50ms
    const segmentStartTime = startTime + delay;

    function updateSegment(currentTime) {
      const elapsed = currentTime - segmentStartTime;

      if (elapsed < 0) {
        // Not started yet
        requestAnimationFrame(updateSegment);
        return;
      }

      const progress = Math.min(elapsed / totalDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

      const targetWidth = segment.dataset.targetWidth; // e.g., "78%"
      const currentWidth = parseFloat(targetWidth) * eased;

      segment.style.width = currentWidth + '%';

      // Animate opacity simultaneously
      segment.style.opacity = 0.3 + (0.7 * eased);

      if (progress < 1) {
        requestAnimationFrame(updateSegment);
      } else {
        // Trigger completion event
        segment.classList.add('animation-complete');
      }
    }

    requestAnimationFrame(updateSegment);
  });
}
```

**Stage 3: Numbers Count Up (600-1000ms)**
- While bar grows, numbers count from 0 to final value
- Synchronized timing so both complete together

**Visual Enhancement**:
```css
.bar-segment {
  position: relative;
  height: 100%;
  transition: filter 200ms ease;
}

.bar-segment::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(to right,
    transparent,
    rgba(255,255,255,0.3)
  );
  animation: shimmer 1.5s ease-in-out infinite;
  opacity: 0;
}

.bar-segment:hover::after {
  opacity: 1;
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}
```

---

### 5. Section Expand/Collapse

**Trigger**: Click on section header or "Expand" button

**Duration**: 400ms

**Implementation**:

```javascript
class ExpandableSection {
  constructor(element) {
    this.element = element;
    this.header = element.querySelector('.section-header');
    this.content = element.querySelector('.section-content');
    this.expanded = element.classList.contains('expanded');

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.header.addEventListener('click', () => this.toggle());

    // Keyboard accessibility
    this.header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    if (this.expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  expand() {
    this.expanded = true;
    this.element.classList.add('expanded');
    this.header.setAttribute('aria-expanded', 'true');

    // Measure target height
    this.content.style.display = 'block';
    const targetHeight = this.content.scrollHeight;
    this.content.style.height = '0';

    // Trigger reflow
    this.content.offsetHeight;

    // Animate to target height
    this.content.style.height = targetHeight + 'px';

    // Remove fixed height after animation
    setTimeout(() => {
      this.content.style.height = 'auto';
      this.content.focus(); // Focus for screen readers
    }, 400);

    // Rotate arrow icon
    const icon = this.header.querySelector('.expand-icon');
    if (icon) {
      icon.style.transform = 'rotate(180deg)';
    }
  }

  collapse() {
    this.expanded = false;
    this.element.classList.remove('expanded');
    this.header.setAttribute('aria-expanded', 'false');

    // Set current height
    const currentHeight = this.content.scrollHeight;
    this.content.style.height = currentHeight + 'px';

    // Trigger reflow
    this.content.offsetHeight;

    // Animate to 0
    this.content.style.height = '0';

    // Hide after animation
    setTimeout(() => {
      this.content.style.display = 'none';
    }, 400);

    // Rotate arrow icon back
    const icon = this.header.querySelector('.expand-icon');
    if (icon) {
      icon.style.transform = 'rotate(0deg)';
    }
  }
}
```

**CSS**:
```css
.section-header {
  cursor: pointer;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
  border-radius: 4px;
  transition: background 200ms ease;
}

.section-header:hover {
  background: #e8e8e8;
}

.section-header:focus {
  outline: 2px solid #007acc;
  outline-offset: 2px;
}

.expand-icon {
  transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
  width: 20px;
  height: 20px;
}

.section-content {
  overflow: hidden;
  transition: height 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.section-content.animating {
  opacity: 0.7;
}
```

---

## Gesture & Input Patterns

### Touch Gestures (Mobile/Tablet)

**1. Swipe Down to Dismiss Modal**

**Gesture**: Vertical swipe downward from anywhere in modal

**Threshold**: Minimum 100px movement with velocity >0.3px/ms

**Behavior**:
```javascript
class SwipeToDismiss {
  constructor(modalElement, onDismiss) {
    this.modal = modalElement;
    this.onDismiss = onDismiss;
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.startTime = 0;

    this.setupGestureListeners();
  }

  setupGestureListeners() {
    this.modal.addEventListener('touchstart', (e) => {
      this.startY = e.touches[0].clientY;
      this.startTime = Date.now();
      this.isDragging = true;
      this.modal.style.transition = 'none';
    });

    this.modal.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;

      this.currentY = e.touches[0].clientY;
      const deltaY = this.currentY - this.startY;

      // Only allow downward swipes
      if (deltaY > 0) {
        const translateY = Math.min(deltaY, window.innerHeight);
        const opacity = 1 - (deltaY / window.innerHeight);

        this.modal.style.transform = `translateY(${translateY}px)`;
        this.modal.style.opacity = opacity;

        // Prevent scrolling body
        e.preventDefault();
      }
    });

    this.modal.addEventListener('touchend', (e) => {
      if (!this.isDragging) return;

      const deltaY = this.currentY - this.startY;
      const deltaTime = Date.now() - this.startTime;
      const velocity = deltaY / deltaTime; // px/ms

      this.modal.style.transition = 'transform 300ms ease, opacity 300ms ease';

      // Dismiss if swiped far enough OR fast enough
      if (deltaY > 100 || velocity > 0.3) {
        // Dismiss
        this.modal.style.transform = `translateY(${window.innerHeight}px)`;
        this.modal.style.opacity = '0';
        setTimeout(() => {
          this.onDismiss();
        }, 300);
      } else {
        // Snap back
        this.modal.style.transform = 'translateY(0)';
        this.modal.style.opacity = '1';
      }

      this.isDragging = false;
    });
  }
}
```

**Visual Feedback**:
- Rubber-band effect at top of screen (resistance when swiping up)
- Modal follows finger 1:1 during swipe
- Background dims proportionally (opacity decreases as modal moves down)
- Haptic feedback on dismiss threshold (if available)

---

**2. Pinch to Zoom Keyboard Heatmap**

**Gesture**: Two-finger pinch/spread on keyboard visualization

**Scale Range**: 0.8x to 2.0x

**Behavior**:
- Pinch in: Zoom out to see full keyboard
- Spread out: Zoom in to see key details
- Double-tap: Reset to 1.0x scale
- Maintains center point of pinch gesture

---

**3. Swipe Left/Right for Session Navigation**

**Gesture**: Horizontal swipe on results modal

**Purpose**: Navigate between current and previous session results

**Threshold**: 50px horizontal movement

**Visual Indicator**:
```
┌─────────────────────────────┐
│  ← Previous    Current  Next → │
│  ●○○○○○○○○○○○○○○○○○●  │
│  Session 2/18               │
└─────────────────────────────┘
```

---

### Keyboard Shortcuts

**Global Shortcuts** (when modal is active):

| Key | Action | Description |
|-----|--------|-------------|
| `Esc` | Close modal | Dismiss results and return to practice view |
| `Enter` | Practice Again | Start new session with same config |
| `N` | New Challenge | Load different code snippet |
| `S` | View Stats | Navigate to statistics page |
| `?` | Show help | Display keyboard shortcuts overlay |
| `H` | Toggle heatmap | Show/hide keyboard heatmap |
| `I` | Toggle insights | Expand/collapse insights section |
| `C` | Copy results | Copy formatted results to clipboard |

**Navigation Shortcuts**:

| Key | Action |
|-----|--------|
| `Tab` | Next interactive element |
| `Shift + Tab` | Previous interactive element |
| `↑/↓` | Scroll page up/down |
| `Home` | Scroll to top |
| `End` | Scroll to bottom |
| `Space` | Page down |
| `Shift + Space` | Page up |

**Keyboard Heatmap Shortcuts**:

| Key | Action |
|-----|--------|
| `Arrow keys` | Navigate between keys |
| `Enter` | Open detailed analysis for key |
| `1-5` | Filter by error level (1=lowest, 5=highest) |
| `A` | Show all keys |

**Implementation**:
```javascript
class KeyboardShortcutHandler {
  constructor(modal) {
    this.modal = modal;
    this.shortcuts = new Map([
      ['Escape', () => this.closeModal()],
      ['Enter', () => this.practiceAgain()],
      ['n', () => this.newChallenge()],
      ['s', () => this.viewStats()],
      ['?', () => this.showHelp()],
      ['h', () => this.toggleHeatmap()],
      ['i', () => this.toggleInsights()],
      ['c', () => this.copyResults()],
    ]);

    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.matches('input, textarea')) return;

      // Check for modifier keys
      const hasModifier = e.ctrlKey || e.altKey || e.metaKey;

      // Find matching shortcut
      const key = hasModifier ? null : e.key.toLowerCase();
      const handler = this.shortcuts.get(key);

      if (handler) {
        e.preventDefault();
        handler();
      }
    });
  }

  showHelp() {
    // Display overlay with all shortcuts
    const helpOverlay = document.createElement('div');
    helpOverlay.className = 'keyboard-shortcuts-help';
    helpOverlay.innerHTML = `
      <div class="shortcuts-modal">
        <h2>Keyboard Shortcuts</h2>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <kbd>Esc</kbd>
            <span>Close modal</span>
          </div>
          <div class="shortcut-item">
            <kbd>Enter</kbd>
            <span>Practice Again</span>
          </div>
          <!-- ...more shortcuts... -->
        </div>
        <button class="close-help">Close (Esc)</button>
      </div>
    `;

    document.body.appendChild(helpOverlay);

    // Auto-dismiss on Esc or click outside
    const closeHelp = () => {
      helpOverlay.remove();
    };

    helpOverlay.addEventListener('click', (e) => {
      if (e.target === helpOverlay) closeHelp();
    });

    helpOverlay.querySelector('.close-help').addEventListener('click', closeHelp);
  }
}
```

---

## Data Visualization Guidelines

### Character Breakdown Stacked Bar

**Purpose**: Show proportion of correct, incorrect, and unproductive keystrokes

**Visual Design**:

```
┌────────────────────────────────────────────────────┐
│ Typed Characters: 748                              │
│ ┌────────────────────────────────────────────────┐ │
│ │████████████████████████░░░░░░░░                │ │
│ │←──────582 correct──────→│130│                  │ │
│ │        (77.8%)          │waste                 │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ Breakdown:                                         │
│ ✓ Correctly typed:   582  (77.8%)  [Green]        │
│ ✗ Incorrectly typed:  36  ( 4.8%)  [Red]          │
│ ↩ Backspaces:        130  (17.4%)  [Orange]       │
└────────────────────────────────────────────────────┘
```

**Color Scheme**:
- Correct: #4ec9b0 (teal green)
- Incorrect: #f48771 (soft red)
- Unproductive: #ff9800 (amber orange)

**Accessibility**:
- Pattern overlays for colorblind users (diagonal lines, dots, solid)
- Text labels always visible
- ARIA label: "Stacked bar chart showing 77.8% correct, 4.8% incorrect, 17.4% wasted"

**Interaction**:
- Hover over segment: Tooltip with exact counts
- Click segment: Drill down to see individual instances
- Touch: Long-press for tooltip

---

### Keyboard Error Heatmap

**Data Encoding**:

**Error Frequency → Color**:
```
0-2 errors:   #4caf50  rgb(76, 201, 80)   [Green]
3-5 errors:   #ffeb3b  rgb(255, 235, 59)  [Yellow]
6-9 errors:   #ff9800  rgb(255, 152, 0)   [Orange]
10+ errors:   #f44336  rgb(244, 67, 54)   [Red]
No data:      #e0e0e0  rgb(224, 224, 224) [Gray]
```

**Error Count → Badge Size**:
- Small (0-2): 14px font
- Medium (3-5): 16px font
- Large (6-9): 18px font, bold
- XLarge (10+): 20px font, bold, pulsing

**Keyboard Layout**:
```
┌───────────────────────────────────────────────────────┐
│  1   2   3   4   5   6   7   8   9   0   -   =   ⌫   │
│   🟢Q  🟢W  🟢E  🟢R  🟢T  🟢Y  🟢U  🟢I  🟢O  🟢P  🔴[ 🔴] │
│    🟢A  🟢S  🟢D  🟢F  🟢G  🟢H  🟢J  🟢K  🟢L  🟠; 🟡'    │
│     🟢Z  🟢X  🟢C  🟢V  🟢B  🟢N  🟢M  🟢,  🟢.  🟡/      │
│               [        Space        ]                  │
└───────────────────────────────────────────────────────┘

Legend:  🟢 0-2   🟡 3-5   🟠 6-9   🔴 10+   ⚪ Unused
```

**SVG Structure** (for performance):
```svg
<svg viewBox="0 0 800 300" class="keyboard-heatmap">
  <defs>
    <!-- Define key templates -->
    <rect id="key-template" width="50" height="50" rx="4"/>

    <!-- Define gradients for keys -->
    <linearGradient id="key-gradient-green">
      <stop offset="0%" stop-color="#4caf50"/>
      <stop offset="100%" stop-color="#388e3c"/>
    </linearGradient>
  </defs>

  <!-- Key group -->
  <g class="key-row" transform="translate(10, 10)">
    <!-- Individual key -->
    <g class="keyboard-key" data-key="q" data-errors="2">
      <use href="#key-template" fill="url(#key-gradient-green)"/>
      <text x="25" y="25" text-anchor="middle" dy=".3em">Q</text>
      <text x="25" y="40" text-anchor="middle" class="error-count">2</text>
    </g>
    <!-- More keys... -->
  </g>
</svg>
```

**Performance Optimization**:
- Single SVG element (not individual DOM nodes per key)
- Use `<use>` elements to reference shared templates
- CSS transforms for hover effects (not JavaScript)
- Virtualization if showing multiple keyboard layouts

---

### Progress Comparison Table

**Visual Design**:

```
┌──────────────────┬──────────────┬──────────────┬──────────────┐
│                  │  This Run    │  Last Run    │  Avg (10)    │
├──────────────────┼──────────────┼──────────────┼──────────────┤
│ Net WPM          │  47 🔼+5     │  42          │  45          │
│ Gross WPM        │  59          │  53          │  57          │
│ Accuracy         │  94.2% 🔽-1.3│  95.5%       │  93.8% 🔼+0.4│
│ Duration         │  2:28        │  2:15        │  2:32        │
│ Errors           │  36          │  28          │  38          │
│ Error Rate       │  5.8%        │  4.5%        │  6.2% 🔼-0.4 │
└──────────────────┴──────────────┴──────────────┴──────────────┘

  [View Detailed History] [Export CSV]
```

**Conditional Formatting**:
- Green background: Value better than average
- Red background: Value worse than average
- Bold text: Personal best
- Trophy icon: New record

**Sparkline Integration**:
```
┌──────────────────┬──────────────┬──────────────┬──────────────┐
│ Net WPM          │  47          │  📈 ▂▃▅▇█    │  45          │
│                  │              │  Last 10     │              │
└──────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Modal Behavior Patterns

### Modal Lifecycle

**1. Entrance** (Desktop):
```css
@keyframes modalEnterDesktop {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.results-modal {
  animation: modalEnterDesktop 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.results-modal-backdrop {
  animation: backdropFadeIn 300ms ease;
}

@keyframes backdropFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**2. Entrance** (Mobile):
```css
@keyframes modalEnterMobile {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}

.results-modal {
  animation: modalEnterMobile 350ms cubic-bezier(0.4, 0, 0.2, 1);
  /* Bottom-sheet style */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 90vh;
  border-radius: 16px 16px 0 0;
}
```

**3. Exit**:
```css
@keyframes modalExitDesktop {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
}

@keyframes modalExitMobile {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100%);
  }
}
```

**4. Background Scroll Lock**:
```javascript
class ScrollLockManager {
  constructor() {
    this.scrollPosition = 0;
    this.locked = false;
  }

  lock() {
    if (this.locked) return;

    // Save current scroll position
    this.scrollPosition = window.pageYOffset;

    // Apply styles to body
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.width = '100%';

    this.locked = true;
  }

  unlock() {
    if (!this.locked) return;

    // Remove fixed positioning
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';

    // Restore scroll position
    window.scrollTo(0, this.scrollPosition);

    this.locked = false;
  }
}
```

---

## Responsive Breakpoint Behaviors

### Breakpoint Strategy

**Breakpoints**:
- Mobile Small: 0-375px (iPhone SE)
- Mobile: 376-767px (standard phones)
- Tablet: 768-1199px (iPad, small laptops)
- Desktop: 1200px+ (standard desktops)

**Layout Transformations**:

**Desktop (1200px+)**:
- 4-column metric cards
- Side-by-side layout for analysis and heatmap
- Full keyboard heatmap with all keys
- Multi-column comparison table
- Hover interactions enabled

**Tablet (768-1199px)**:
- 2-column metric cards
- Stacked layout for analysis and heatmap
- Compact keyboard (90% scale)
- Scrollable comparison table
- Touch-optimized tap targets (44px minimum)

**Mobile (376-767px)**:
- 1-column metric cards
- Fully stacked layout
- Collapsed keyboard (show top 5 problem keys only)
- Simplified comparison (current vs average only)
- Full-screen modal takeover
- Bottom action sheet style

**Mobile Small (0-375px)**:
- Same as mobile but with:
  - Reduced font sizes (90% scale)
  - Tighter spacing (16px → 12px)
  - Collapsed sections by default

**CSS Implementation**:
```css
/* Base (Mobile First) */
.results-modal {
  position: fixed;
  inset: 0;
  background: white;
  overflow-y: auto;
  padding: 16px;
}

.metric-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.keyboard-heatmap-full {
  display: none;
}

.keyboard-heatmap-compact {
  display: block;
}

/* Tablet */
@media (min-width: 768px) {
  .results-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    border-radius: 12px;
    padding: 24px;
  }

  .metric-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .results-modal {
    max-width: 1200px;
    padding: 32px;
  }

  .metric-cards {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .analysis-and-heatmap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .keyboard-heatmap-full {
    display: block;
  }

  .keyboard-heatmap-compact {
    display: none;
  }
}
```

---

## Error & Edge Case Flows

### Error Scenarios

**1. API Timeout (>3s)**

Flow:
```
User completes session
  ↓
API request sent (POST /api/session/complete)
  ↓
[Wait 3 seconds]
  ↓
No response received
  ↓
Show partial results from client-side calculation:
  - Basic WPM (chars / time)
  - Simple accuracy (correct / total)
  - Duration
  ↓
Display message:
  "⚠️ Detailed analysis unavailable
  Basic metrics shown. Results saved locally.
  [Retry Analysis]"
  ↓
User clicks [Retry]:
  - Attempt API call again
  - Show loading spinner
  - If succeeds: Replace with full results
  - If fails again: Keep basic results
```

**2. Network Disconnection**

Flow:
```
User completes session
  ↓
Detect offline (navigator.onLine === false)
  ↓
Skip API call entirely
  ↓
Calculate all metrics client-side:
  - WPM, accuracy, error count
  - Character breakdown
  - Save to localStorage
  ↓
Show results with offline indicator:
  "📡 Offline Mode
  Results saved locally and will sync when online.
  [View Offline Results]"
  ↓
Background: Set up service worker to retry sync when online
```

**3. Calculation Error**

Flow:
```
API returns 500 error or invalid data
  ↓
Log error to console/monitoring service
  ↓
Fall back to partial results:
  - Show metrics that were successfully calculated
  - Hide failed visualizations
  ↓
Display error panel:
  "⚠️ Some metrics unavailable
  We encountered an issue calculating detailed statistics.
  Basic results are shown below.

  Error ID: #abc123 (for support)
  [Report Issue] [Continue]"
```

**4. Very Short Session (<10s)**

```
User completes session in 8 seconds
  ↓
Check session duration
  ↓
Display limited results:
  "Session Complete! (Too short for detailed analysis)

  Quick Stats:
  • Duration: 0:08
  • Characters typed: 45
  • WPM: ~67 (extrapolated)

  ℹ️ For detailed insights, try typing for at least 30 seconds.

  [Try Longer Session] [Practice Again]"
```

**5. Perfect Session (100% accuracy)**

```
User completes session with zero errors
  ↓
Calculate metrics normally
  ↓
Display celebration:
  "🎉 Perfect! 100% Accuracy!

  [Confetti animation]

  Your Stats:
  • WPM: 47
  • Accuracy: 100%
  • Duration: 2:28
  • Zero errors!

  ✨ All keyboard keys green

  💪 Ready for a harder challenge?
  [Increase Difficulty] [Practice Again]"
```

---

## Conclusion

This interaction patterns document provides implementation-ready specifications for every micro-interaction, gesture, animation, and state transition in the TypeSpeed results screen.

Key principles applied throughout:

1. **Progressive Enhancement**: Core functionality works without advanced features
2. **Performance First**: Animations use CSS transforms, lazy loading for heavy content
3. **Accessibility Built-In**: Keyboard navigation, screen reader support, focus management
4. **Responsive by Design**: Touch and mouse interactions, adaptive layouts
5. **Graceful Degradation**: Error states are informative and actionable

These patterns ensure consistent, polished user experience across all devices and interaction methods while maintaining the educational and motivational goals of the results screen.
