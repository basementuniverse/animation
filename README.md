# Game Component: Animation

A component for creating keyframe animations or interpolated animations for scalar values, vectors, and colors.

## Installation

```bash
npm install @basementuniverse/animation
```

## How to use

See `/demos` for some examples.

```js
import {
  AnimationMode,
  RepeatMode,
  AnimationOptions,
  Animation,
  MultiAnimation,
  EasingFunctions,
} from '@basementuniverse/animation';
```

### `Animation`

Create an animation:

```js
const animation = new Animation({
  initialValue: 100,
  targetValue: 500,
  mode: AnimationMode.Auto,
  repeat: RepeatMode.Once,
  repeats: 0,
  duration: 3,
  delay: 0,
  clamp: false,
  round: false,
  easeAmount: 0,
  stops: [],
  interpolationFunction: 'linear',
  interpolationFunctionParameters: [],
});
```

Update the animation every frame:

```js
function update(dt) {
  animation.update(dt);
}
```

Use the animated value:

```js
const value = animation.current;
```

Control the animation:

```js
animation.start();
animation.stop();
animation.reset();
```

The animated value can be `number`, `vec2`, `vec3`, or `Color`.

```ts
type vec2 = {
  x: number;
  y: number;
};

type vec3 = {
  x: number;
  y: number;
  z: number;
};

type Color = {
  r: number;
  g: number;
  b: number;
  a?: number;
};
```

Public properties:

- `progress`: Current normalised progress of the animation (0 to 1)
- `running`: Whether the animation is currently running
- `holding`: Whether the animation is currently being held (for `Hold` mode)
- `direction`: Direction of the animation (1 = forward, -1 = backward)
- `repeatCount`: Number of completed repeats
- `finished`: Whether the animation has finished (for `Once` repeat mode)

### `MultiAnimation`

```js
const multiAnimation = new MultiAnimation({
  // The _default animation will be used as a base for all other animations
  _default: {
    mode: AnimationMode.Auto,
    repeat: RepeatMode.PingPong,
    duration: 2,
    interpolationFunction: 'ease-in-out-cubic',
  },
  scale: {
    initialValue: 1,
    targetValue: 2,
    duration: 1,
  },
  rotation: {
    initialValue: 0,
    targetValue: Math.PI * 2,
    repeat: RepeatMode.Loop,
    duration: 3,
  },
  // etc.
});
```

### Spline Interpolation

The library includes built-in support for animating along Bezier and Catmull-Rom splines:

```js
import { bezierPath, catmullRomPath } from '@basementuniverse/animation';

// Cubic Bezier path with control points in normalized space
const bezierAnimation = new Animation({
  initialValue: { x: 0, y: 0 },
  targetValue: { x: 100, y: 100 },
  duration: 2,
  interpolationFunction: bezierPath({
    points: [
      { x: 0.25, y: 0.8 },  // Control point 1
      { x: 0.75, y: 0.2 }   // Control point 2
    ],
    order: 3,              // Cubic Bezier (1=linear, 2=quadratic, 3=cubic)
    relative: 'start-end', // Points in normalized 0-1 space
    useAnimationEndpoints: true  // Use initialValue/targetValue as endpoints
  })
});

// Catmull-Rom spline through multiple waypoints
const splineAnimation = new Animation({
  initialValue: { x: 0, y: 0 },
  targetValue: { x: 300, y: 300 },
  duration: 3,
  interpolationFunction: catmullRomPath({
    points: [
      { x: 50, y: 200 },   // Waypoint 1
      { x: 150, y: 50 },   // Waypoint 2
      { x: 250, y: 250 }   // Waypoint 3
    ],
    tension: 0.5,          // Controls curve tightness (0-1)
    relative: 'none'       // Absolute coordinates
  })
});
```

#### Relative positioning modes

Both `bezierPath` and `catmullRomPath` support three positioning modes:

- `'none'`: Points are absolute coordinates
- `'start'`: Points are offsets from `initialValue`
- `'start-end'`: Points are in normalized 0-1 space, scaled between `initialValue` and `targetValue`

```js
// Example: Start-relative positioning
const animation = new Animation({
  initialValue: { x: 100, y: 100 },
  targetValue: { x: 400, y: 400 },
  interpolationFunction: bezierPath({
    points: [
      { x: 50, y: -50 },   // 50 units right, 50 units up from start
      { x: 250, y: 150 }   // 250 units right, 150 units down from start
    ],
    order: 3,
    relative: 'start'
  })
});
```

See `./demos/spline-animation.html` for interactive examples.

## Animation options

```ts
export enum AnimationMode {
  /**
   * Animation starts automatically when created
   */
  Auto = 'auto',

  /**
   * Animation starts when triggered manually by calling the `start` method
   */
  Trigger = 'trigger',

  /**
   * Animation plays while triggered, and reverses when not triggered
   */
  Hold = 'hold',

  /**
   * Animation is controlled manually by setting the progress
   */
  Manual = 'manual',
}

export enum RepeatMode {
  /**
   * Animation will play once and then stop
   */
  Once = 'once',

  /**
   * Animation will loop indefinitely
   */
  Loop = 'loop',

  /**
   * Animation will play forward and then reverse, repeating indefinitely
   */
  PingPong = 'pingpong',
}

export type AnimationOptions<T extends AnimatableValue> = {
  /**
   * The initial value for this animation
   */
  initialValue: T;

  /**
   * The target value for this animation
   */
  targetValue: T;

  /**
   * The mode of this animation:
   *
   * - Auto: Animation starts automatically when created
   * - Trigger: Animation starts when triggered manually by calling the `start`
   *   method
   * - Hold: Animation plays while triggered, and reverses when not triggered
   * - Manual: Animation is controlled manually by setting the progress
   *
   * Default is Auto
   */
  mode: AnimationMode;

  /**
   * The repeat mode of this animation:
   *
   * - Once: Animation will play once and then stop
   * - Loop: Animation will loop indefinitely or a specific number of times
   * - PingPong: Animation will play forward and then reverse, repeating
   *   indefinitely or a specific number of times
   *
   * Default is Once
   */
  repeat: RepeatMode;

  /**
   * If repeat mode is Loop or PingPong, the number of times to repeat the
   * animation
   *
   * Default is 0 (repeat indefinitely)
   */
  repeats: number;

  /**
   * The duration of this animation in seconds
   */
  duration: number;

  /**
   * Optional delay before the animation starts, in seconds
   */
  delay?: number;

  /**
   * If true, the progress value will be clamped between 0 and 1
   *
   * When this is false, we can have "overshoot" values less than 0 or greater
   * than 1
   */
  clamp?: boolean;

  /**
   * If true, the value will be rounded to the nearest integer
   *
   * Alternatively, we can provide a custom rounding function which takes the
   * value and returns the rounded value
   */
  round?: boolean | ((value: T) => T);

  /**
   * Optionally ease the value towards the target value over time (exponential
   * easing)
   *
   * A higher value means more easing:
   * - 0 to disable easing (value will change immediately)
   * - 1 to enable full easing (value will never change)
   */
  easeAmount?: number;

  /**
   * An array of stops for keyframe animations. Each stop should have a progress
   * value between 0 and 1, and a corresponding value for the animation at that
   * progress point
   *
   * If a stop with progress 0 or 1 is provided, these will take precendence
   * over the initialValue and targetValue options, otherwise the initialValue
   * and targetValue will be used as the first and last stops respectively
   *
   * Stops should be provided in ascending order of progress (from 0 to 1)
   */
  stops?: {
    progress: number;
    value: T;
  }[];

  /**
   * How to interpolate between initial and target values, or between keyframes
   *
   * Default interpolation function is 'linear'
   *
   * See `EasingFunctions` for a list of built-in easing functions
   */
  interpolationFunction?:
    | keyof typeof EasingFunctions
    | ((a: T, b: T, i: number, ...params: any[]) => T);

  /**
   * Optional parameters to pass to the interpolation function
   */
  interpolationFunctionParameters?: any[];

  /**
   * Optional callback when the animation reaches the end
   *
   * This will be called every time the animation progress reaches 1
   */
  onFinished?: () => void;

  /**
   * Optional callback each time the animation repeats (only for Loop and
   * PingPong repeat modes)
   *
   * The callback receives the current repeat count (starting from 1)
   */
  onRepeat?: (count: number) => void;

  /**
   * Optional callback each time the animation reaches a stop/keyframe
   *
   * The callback receives the index of the stop reached (starting from 0)
   */
  onStopReached?: (index: number) => void;
};
```

## Built-in easing functions

See `./demos/easing-functions.html` for a demo of all built-in easing functions.
