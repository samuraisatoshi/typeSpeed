---
name: performance-optimization
description: >
  Identifies and fixes performance bottlenecks in TypeScript/JavaScript applications.
  Analyzes code for algorithmic complexity, memory leaks, unnecessary re-renders,
  bundle size issues, and database query optimization. PROACTIVELY suggests
  performance improvements during development.
allowed-tools: Read, Grep, Glob, Bash, Write, Edit
---

# Performance Optimization Skill

## When to Use This Skill
- When application feels slow or unresponsive
- Before deploying to production
- When handling large datasets
- During code review for performance-critical features
- When bundle size exceeds targets
- When memory usage increases over time

## Performance Analysis Areas

### 1. Algorithmic Complexity
Identify and fix O(n²) or worse algorithms:

```typescript
// Bad: O(n²) nested loops
function findDuplicates(arr: number[]): number[] {
  const duplicates: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}

// Good: O(n) with Set
function findDuplicates(arr: number[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();

  for (const num of arr) {
    if (seen.has(num)) {
      duplicates.add(num);
    }
    seen.add(num);
  }

  return Array.from(duplicates);
}
```

### 2. Memory Leak Detection

Common memory leak patterns:
```typescript
// Memory Leak: Event listeners not removed
class Component {
  constructor() {
    // Bad: Never removed
    window.addEventListener('resize', this.handleResize);
  }

  handleResize = () => { /* ... */ };
}

// Good: Clean up listeners
class Component {
  constructor() {
    window.addEventListener('resize', this.handleResize);
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => { /* ... */ };
}
```

### 3. Database Query Optimization

```typescript
// Bad: N+1 query problem
async function getUsersWithPosts() {
  const users = await User.findAll();
  for (const user of users) {
    user.posts = await Post.findByUserId(user.id); // N queries
  }
  return users;
}

// Good: Single query with join
async function getUsersWithPosts() {
  return await User.findAll({
    include: [{ model: Post }]
  });
}
```

### 4. Frontend Optimizations

#### React/Component Optimization
```typescript
// Bad: Unnecessary re-renders
function ExpensiveComponent({ data, filter }) {
  const filtered = data.filter(item => item.includes(filter)); // Recalculated every render
  return <div>{filtered.map(/* ... */)}</div>;
}

// Good: Memoized computation
function ExpensiveComponent({ data, filter }) {
  const filtered = useMemo(
    () => data.filter(item => item.includes(filter)),
    [data, filter]
  );
  return <div>{filtered.map(/* ... */)}</div>;
}
```

#### DOM Manipulation
```typescript
// Bad: Multiple reflows
function addElements(items: string[]) {
  items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item;
    document.body.appendChild(div); // Triggers reflow each time
  });
}

// Good: Batch DOM updates
function addElements(items: string[]) {
  const fragment = document.createDocumentFragment();
  items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item;
    fragment.appendChild(div);
  });
  document.body.appendChild(fragment); // Single reflow
}
```

### 5. Bundle Size Optimization

#### Dynamic Imports
```typescript
// Bad: Everything loaded upfront
import HeavyLibrary from 'heavy-library';

// Good: Lazy load when needed
const HeavyLibrary = await import('heavy-library');
```

#### Tree Shaking
```typescript
// Bad: Import entire library
import * as _ from 'lodash';
const result = _.debounce(fn, 100);

// Good: Import only what's needed
import debounce from 'lodash/debounce';
const result = debounce(fn, 100);
```

## Performance Patterns

### 1. Debouncing & Throttling
```typescript
// Debounce: Delay execution until pause
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle: Limit execution frequency
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

### 2. Virtual Scrolling
```typescript
// For large lists, render only visible items
class VirtualScroller {
  private itemHeight = 50;
  private visibleCount = Math.ceil(window.innerHeight / this.itemHeight);

  renderVisibleItems(items: any[], scrollTop: number) {
    const start = Math.floor(scrollTop / this.itemHeight);
    const end = start + this.visibleCount;

    return items.slice(start, end).map((item, i) => ({
      ...item,
      style: {
        position: 'absolute',
        top: (start + i) * this.itemHeight
      }
    }));
  }
}
```

### 3. Web Workers for Heavy Computation
```typescript
// Move heavy computation off main thread
// worker.ts
self.addEventListener('message', (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
});

// main.ts
const worker = new Worker('worker.js');
worker.postMessage(data);
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};
```

### 4. Caching Strategies
```typescript
// Memoization for expensive functions
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// LRU Cache for limited memory
class LRUCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private maxSize: number) {}

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

## Performance Metrics

### Key Metrics to Track
- **Time to First Byte (TTFB)**: < 200ms
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Performance Monitoring
```typescript
// Measure function execution time
function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    console.log(`${name} took ${end - start}ms`);
    return result;
  }) as T;
}

// Memory usage tracking
function getMemoryUsage() {
  if (performance.memory) {
    return {
      used: performance.memory.usedJSHeapSize / 1048576,
      total: performance.memory.totalJSHeapSize / 1048576,
      limit: performance.memory.jsHeapSizeLimit / 1048576
    };
  }
  return null;
}
```

## Optimization Checklist

### Before Optimization
- [ ] Profile to identify bottlenecks
- [ ] Measure baseline performance
- [ ] Set performance targets
- [ ] Consider trade-offs

### Algorithm Optimization
- [ ] Reduce time complexity
- [ ] Minimize space complexity
- [ ] Use appropriate data structures
- [ ] Cache expensive computations

### Memory Optimization
- [ ] Remove event listeners
- [ ] Clear timers/intervals
- [ ] Avoid memory leaks
- [ ] Use WeakMap/WeakSet for references

### Network Optimization
- [ ] Minimize API calls
- [ ] Implement pagination
- [ ] Use compression (gzip/brotli)
- [ ] Enable HTTP/2
- [ ] Implement caching headers

### Frontend Optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Minimize bundle size
- [ ] Reduce render blocking resources

### Database Optimization
- [ ] Add proper indexes
- [ ] Optimize queries
- [ ] Use connection pooling
- [ ] Implement caching layer
- [ ] Batch operations

## Performance Testing

### Load Testing Script
```bash
#!/bin/bash
# Simple load test
for i in {1..100}; do
  curl -s -o /dev/null -w "%{time_total}\n" http://localhost:3000/api/endpoint &
done
wait
```

### Memory Leak Detection
```typescript
// Monitor memory growth
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`Memory: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);

  // Alert if memory keeps growing
  if (usage.heapUsed > 500 * 1024 * 1024) {
    console.error('Possible memory leak detected!');
  }
}, 10000);
```

## Optimization Examples

### TypeSpeed Specific Optimizations

#### 1. Optimize Burst WPM Calculation
```typescript
// Current O(n²) - from MetricsCalculator.ts
// Optimized O(n) using sliding window
private calculateBurstWPM(inputs: CharacterInput[]): number {
  if (inputs.length < 2) return 0;

  const windowMs = MetricsCalculator.BURST_WINDOW * 1000;
  const windowMinutes = MetricsCalculator.BURST_WINDOW / 60;
  let maxWPM = 0;
  let windowStart = 0;

  for (let windowEnd = 0; windowEnd < inputs.length; windowEnd++) {
    // Remove inputs outside window
    while (windowStart < windowEnd &&
           inputs[windowEnd].timestamp - inputs[windowStart].timestamp > windowMs) {
      windowStart++;
    }

    const charCount = windowEnd - windowStart + 1;
    const windowWPM = (charCount / 5) / windowMinutes;
    maxWPM = Math.max(maxWPM, windowWPM);
  }

  return maxWPM;
}
```

#### 2. Optimize Code Display Rendering
```typescript
// Use requestAnimationFrame for smooth updates
class OptimizedRenderer {
  private pendingUpdates: Update[] = [];
  private rafId: number | null = null;

  scheduleUpdate(update: Update): void {
    this.pendingUpdates.push(update);

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  private flush(): void {
    // Batch all DOM updates
    this.pendingUpdates.forEach(update => update.apply());
    this.pendingUpdates = [];
    this.rafId = null;
  }
}
```

#### 3. Optimize Session Storage
```typescript
// Use Map with size limit
class SessionManager {
  private sessions = new Map<string, TypingSession>();
  private maxSessions = 100;

  addSession(id: string, session: TypingSession): void {
    // Remove oldest if at limit
    if (this.sessions.size >= this.maxSessions) {
      const firstKey = this.sessions.keys().next().value;
      this.sessions.delete(firstKey);
    }

    this.sessions.set(id, session);
  }
}
```

## Reporting

Generate performance report:
```markdown
# Performance Report
Date: {{date}}
Environment: {{environment}}

## Metrics
- Load Time: {{load_time}}ms
- Time to Interactive: {{tti}}ms
- Memory Usage: {{memory}}MB
- Bundle Size: {{bundle_size}}KB

## Bottlenecks Identified
{{bottlenecks}}

## Optimizations Applied
{{optimizations}}

## Results
- Performance Improvement: {{improvement}}%
- Memory Reduction: {{memory_reduction}}%
- Bundle Size Reduction: {{size_reduction}}%
```