# Animation Library API Reference

TypeScript animation library for keyframe animations, interpolated animations for scalar values, vectors, and colors.

## Package Import
```typescript
import { Animation, MultiAnimation, AnimationMode, RepeatMode, AnimationOptions, EasingFunctions } from '@basementuniverse/animation';
```

## Core Types

### AnimatableValue
```typescript
type AnimatableValue = number | vec2 | vec3 | Color;
type vec2 = { x: number; y: number };
type vec3 = { x: number; y: number; z: number };
type Color = { r: number; g: number; b: number; a?: number };
```

### AnimationMode Enum
- `AnimationMode.Auto = 'auto'` - Animation starts automatically when created
- `AnimationMode.Trigger = 'trigger'` - Animation starts when manually calling `start()` method
- `AnimationMode.Hold = 'hold'` - Animation plays while triggered, reverses when not triggered
- `AnimationMode.Manual = 'manual'` - Animation controlled manually by setting the `progress` property

### RepeatMode Enum
- `RepeatMode.Once = 'once'` - Animation plays once and stops
- `RepeatMode.Loop = 'loop'` - Animation loops indefinitely or specific number of times
- `RepeatMode.PingPong = 'pingpong'` - Animation plays forward then reverse, repeating indefinitely or specific number of times

## Animation Class

### Constructor
```typescript
new Animation<T extends AnimatableValue>(options: {
  initialValue: T;
  targetValue: T;
} & Partial<AnimationOptions<T>>)
```

### AnimationOptions<T> Properties
All properties except `initialValue` and `targetValue` are optional:

- `initialValue: T` (required) - Initial value for animation
- `targetValue: T` (required) - Target value for animation
- `mode: AnimationMode` - Default: `AnimationMode.Auto`
- `repeat: RepeatMode` - Default: `RepeatMode.Once`
- `repeats: number` - Number of times to repeat (0 = infinite). Default: 0
- `duration: number` - Duration in seconds. Default: 1
- `delay?: number` - Delay before animation starts, in seconds. Default: 0
- `clamp?: boolean` - Clamp progress between 0-1. Default: true. When false, allows overshoot values <0 or >1
- `round?: boolean | ((value: T) => T)` - Round value to nearest integer or use custom rounding function. Default: false
- `easeAmount?: number` - Exponential easing amount (0=no easing, 1=full easing/never changes). Default: 0
- `stops?: { progress: number; value: T }[]` - Keyframe stops array. Progress values 0-1, ascending order
- `interpolationFunction?: keyof typeof EasingFunctions | ((a: T, b: T, i: number, ...params: any[]) => T)` - Default: 'linear'
- `interpolationFunctionParameters?: any[]` - Parameters passed to interpolation function
- `onFinished?: () => void` - Callback when animation progress reaches 1
- `onRepeat?: (count: number) => void` - Callback on each repeat (Loop/PingPong modes)
- `onStopReached?: (index: number) => void` - Callback when reaching keyframe stop

### Public Properties
- `progress: number` - Current normalized progress (0 to 1)
- `running: boolean` - Whether animation is currently running
- `holding: boolean` - Whether animation is being held (Hold mode)
- `direction: number` - Direction of animation (1 = forward, -1 = backward)
- `repeatCount: number` - Number of completed repeats
- `finished: boolean` - Whether animation has finished (Once repeat mode)
- `current: T` (getter) - Current animated value

### Public Methods
- `start(): void` - Start animation
- `stop(): void` - Stop animation
- `reset(): void` - Reset animation to initial state
- `update(dt: number): void` - Update animation with delta time in seconds

### Usage Examples
```typescript
// Simple number animation
const anim = new Animation({
  initialValue: 0,
  targetValue: 100,
  duration: 2,
  interpolationFunction: 'ease-in-out-cubic'
});
anim.update(1/60); // Call every frame
const value = anim.current;

// Vector animation with keyframes
const vecAnim = new Animation({
  initialValue: { x: 0, y: 0 },
  stops: [
    { progress: 0.25, value: { x: 100, y: 0 } },
    { progress: 0.5, value: { x: 100, y: 100 } },
    { progress: 0.75, value: { x: 0, y: 100 } },
    { progress: 1, value: { x: 0, y: 0 } }
  ],
  repeat: RepeatMode.Loop,
  duration: 4
});

// Color animation
const colorAnim = new Animation({
  initialValue: { r: 255, g: 0, b: 0 },
  targetValue: { r: 0, g: 0, b: 255 },
  duration: 3,
  round: true
});

// Hold mode (plays while held)
const holdAnim = new Animation({
  initialValue: 0,
  targetValue: 100,
  mode: AnimationMode.Hold,
  duration: 1
});
holdAnim.holding = true; // Plays forward
holdAnim.holding = false; // Reverses
```

## MultiAnimation Class

Manages multiple named animations with shared defaults.

### Constructor
```typescript
new MultiAnimation<T extends { [K in keyof T]: AnimatableValue }>(
  options: {
    _default?: Partial<AnimationOptions<any>>
  } & {
    [K in keyof T]?: {
      initialValue: T[K];
      targetValue: T[K];
    } & Partial<AnimationOptions<T[K]>>;
  }
)
```

### Public Properties
- `holding: boolean` (getter/setter) - Set/get holding state for all animations
- `progress: number` (setter) - Set progress for all animations
- `current: T` (getter) - Object with current values of all animations

### Public Methods
- `start(): void` - Start all animations
- `stop(): void` - Stop all animations
- `reset(): void` - Reset all animations
- `update(dt: number): void` - Update all animations with delta time

### Usage Example
```typescript
const multiAnim = new MultiAnimation({
  _default: {
    mode: AnimationMode.Auto,
    repeat: RepeatMode.PingPong,
    duration: 2,
    interpolationFunction: 'ease-in-out-cubic'
  },
  scale: {
    initialValue: 1,
    targetValue: 2,
    duration: 1
  },
  rotation: {
    initialValue: 0,
    targetValue: Math.PI * 2,
    repeat: RepeatMode.Loop,
    duration: 3
  },
  position: {
    initialValue: { x: 0, y: 0 },
    targetValue: { x: 100, y: 100 }
  }
});

multiAnim.update(1/60);
const { scale, rotation, position } = multiAnim.current;
```

## Built-in Easing Functions

All functions in `EasingFunctions` object take `t: number` (0-1) as first parameter. Some accept additional parameters.

### Basic Easing
- `linear: (t) => number`
- `ease-in-quad`, `ease-out-quad`, `ease-in-out-quad: (t) => number`
- `ease-in-cubic`, `ease-out-cubic`, `ease-in-out-cubic: (t) => number`
- `ease-in-quart`, `ease-out-quart`, `ease-in-out-quart: (t) => number`
- `ease-in-quint`, `ease-out-quint`, `ease-in-out-quint: (t) => number`

### Trigonometric Easing
- `ease-in-sine`, `ease-out-sine`, `ease-in-out-sine: (t) => number`
- `ease-in-expo`, `ease-out-expo`, `ease-in-out-expo: (t) => number`
- `ease-in-circ`, `ease-out-circ`, `ease-in-out-circ: (t) => number`

### Back Easing (with overshoot)
- `ease-in-back: (t, magnitude = 1.70158) => number`
- `ease-out-back: (t, magnitude = 1.70158) => number`
- `ease-in-out-back: (t, magnitude = 1.70158) => number`

Parameters: `magnitude` controls overshoot amount

### Elastic Easing (spring-like)
- `ease-in-elastic: (t, magnitude = 1, period = 0.3) => number`
- `ease-out-elastic: (t, magnitude = 1, period = 0.3) => number`
- `ease-in-out-elastic: (t, magnitude = 1, period = 0.45) => number`

Parameters: `magnitude` controls amplitude, `period` controls oscillation frequency

### Bounce Easing
- `ease-in-bounce: (t, bounces = 4, decay = 2) => number`
- `ease-out-bounce: (t, bounces = 4, decay = 2) => number`
- `ease-in-out-bounce: (t, bounces = 4, decay = 2) => number`

Parameters: `bounces` controls number of bounces, `decay` controls bounce decay rate

### Using with Animation
```typescript
// By name
const anim1 = new Animation({
  initialValue: 0,
  targetValue: 100,
  interpolationFunction: 'ease-out-elastic',
  interpolationFunctionParameters: [1, 0.5]
});

// Custom function
const anim2 = new Animation({
  initialValue: 0,
  targetValue: 100,
  interpolationFunction: (a, b, t) => a + (b - a) * Math.pow(t, 3)
});
```

## Animation Behavior Details

### Stops/Keyframes
- Stops define keyframe values at specific progress points (0-1)
- If stop at progress 0 or 1 provided, it overrides `initialValue`/`targetValue`
- Interpolation happens between consecutive stops
- `onStopReached` callback fires when progress matches stop progress (±1e-6 tolerance)

### Repeat Modes
- `Once`: Plays once, sets `finished=true` when complete
- `Loop`: Repeats from start. If `repeats>0`, stops after that many loops
- `PingPong`: Reverses direction at each end. If `repeats>0`, stops after that many direction changes

### Hold Mode
- Animation plays forward when `holding=true`
- Animation reverses when `holding=false`
- Always uses `RepeatMode.Once` internally
- Resets when progress reaches 0 while not holding

### Manual Mode
- Animation doesn't update automatically
- Set `progress` property directly to control animation
- `update()` still applies easing, rounding, and interpolation

### Delay
- Animation waits `delay` seconds before starting
- Delay only applies once at animation start

### Clamp
- When `true` (default): progress clamped to [0, 1]
- When `false`: allows overshooting with elastic/back easing functions

### EaseAmount (Exponential Smoothing)
- Value 0-1, where 0=no smoothing, 1=infinite smoothing
- Blends previous frame's value with current frame's calculated value
- Applied after interpolation, before rounding
- Formula: `value = (1 - ease) * newValue + ease * oldValue`

### Rounding
- `round: true` rounds to nearest integer (works for number, vec2, vec3, Color)
- `round: function` applies custom rounding function to value
- Applied after easing, before returning `current` value

## Default Values
```typescript
{
  mode: AnimationMode.Auto,
  repeat: RepeatMode.Once,
  repeats: 0,
  duration: 1,
  delay: 0,
  clamp: true,
  round: false,
  easeAmount: 0,
  interpolationFunction: 'linear',
  interpolationFunctionParameters: []
}
```
