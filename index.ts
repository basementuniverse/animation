import { clamp } from '@basementuniverse/utils';
import { vec2, vec3 } from '@basementuniverse/vec';

// -----------------------------------------------------------------------------
// Utility types & type guards
// -----------------------------------------------------------------------------

type Color = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

type AnimatableValue = number | vec2 | vec3 | Color;

type EasingFunction = (t: number, ...args: any[]) => number;

type InterpolationFunction<T> = (a: T, b: T, i: number) => T;

function isNumber(value: any): value is number {
  return typeof value === 'number';
}

function isVec2(value: any): value is vec2 {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    typeof value.x === 'number' &&
    typeof value.y === 'number'
  );
}

function isVec3(value: any): value is vec3 {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    'z' in value &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    typeof value.z === 'number'
  );
}

function isColor(value: any): value is Color {
  return (
    typeof value === 'object' &&
    value !== null &&
    'r' in value &&
    'g' in value &&
    'b' in value &&
    typeof value.r === 'number' &&
    typeof value.g === 'number' &&
    typeof value.b === 'number' &&
    (typeof value.a === 'undefined' || typeof value.a === 'number')
  );
}

// -----------------------------------------------------------------------------
// Animation options
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Animation class
// -----------------------------------------------------------------------------

export class Animation<T extends AnimatableValue = number> {
  private static readonly DEFAULT_OPTIONS: Partial<AnimationOptions<any>> = {
    mode: AnimationMode.Auto,
    repeat: RepeatMode.Once,
    repeats: 0,
    duration: 1,
    delay: 0,
    clamp: true,
    round: false,
    easeAmount: 0,
    interpolationFunction: 'linear',
    interpolationFunctionParameters: [],
  };

  private time: number = 0;
  private actualValue: T;
  private options: AnimationOptions<T>;
  private interpolationFunction?: InterpolationFunction<T>;
  private hasCalledFinishedCallback: boolean = false;

  public progress: number = 0;
  public running: boolean = false;
  public holding: boolean = false;
  public direction: number = 1; // 1 = forward, -1 = backward
  public repeatCount: number = 0; // Number of completed repeats
  public finished: boolean = false;

  public constructor(
    options: {
      initialValue: T;
      targetValue: T;
    } & Partial<AnimationOptions<T>>
  ) {
    this.options = {
      ...Animation.DEFAULT_OPTIONS,
      ...options,
    } as AnimationOptions<T>;
    this.interpolationFunction = this.getInterpolationFunction();
    this.actualValue = options.initialValue;
    this.direction = 1;
    this.repeatCount = 0;
    this.finished = false;

    if (this.options.mode === AnimationMode.Auto) {
      this.start();
    }
  }

  private getInterpolationFunction(): InterpolationFunction<T> {
    // A custom interpolation function has been provided, so use this directly
    if (typeof this.options.interpolationFunction === 'function') {
      return this.options.interpolationFunction;
    }

    // Otherwise, look up the easing function by name (defaulting to 'linear')
    const easingFunction: EasingFunction =
      (this.options.interpolationFunction
        ? EasingFunctions[this.options.interpolationFunction]
        : EasingFunctions.linear) || EasingFunctions.linear;

    // Return a new interpolation function that uses the easing function
    return (a: T, b: T, i: number): T => {
      const easedProgress = easingFunction(
        i,
        ...(this.options.interpolationFunctionParameters || [])
      );

      if (isNumber(a) && isNumber(b)) {
        return (a + (b - a) * easedProgress) as T;
      }

      if (isVec2(a) && isVec2(b)) {
        const vecA = a as vec2;
        const vecB = b as vec2;
        return {
          x: vecA.x + (vecB.x - vecA.x) * easedProgress,
          y: vecA.y + (vecB.y - vecA.y) * easedProgress,
        } as T;
      }

      if (isVec3(a) && isVec3(b)) {
        const vecA = a as vec3;
        const vecB = b as vec3;
        return {
          x: vecA.x + (vecB.x - vecA.x) * easedProgress,
          y: vecA.y + (vecB.y - vecA.y) * easedProgress,
          z: vecA.z + (vecB.z - vecA.z) * easedProgress,
        } as T;
      }

      if (isColor(a) && isColor(b)) {
        const colorA = a as Color;
        const colorB = b as Color;
        return {
          r: colorA.r + (colorB.r - colorA.r) * easedProgress,
          g: colorA.g + (colorB.g - colorA.g) * easedProgress,
          b: colorA.b + (colorB.b - colorA.b) * easedProgress,
          a:
            (colorA.a || 1) +
            ((colorB.a || 1) - (colorA.a || 1)) * easedProgress,
        } as T;
      }

      throw new Error('Unsupported animatable value type');
    };
  }

  public get current(): T {
    return this.actualValue;
  }

  public start(): void {
    this.running = true;
  }

  public stop(): void {
    this.running = false;
  }

  public reset(): void {
    this.time = 0;
    this.progress = 0;
    this.actualValue = this.options.initialValue;
    this.running = false;
    this.repeatCount = 0;
    this.direction = 1;
    this.finished = false;
    this.hasCalledFinishedCallback = false;

    if (this.options.mode === AnimationMode.Auto) {
      this.start();
    }
  }

  public update(dt: number): void {
    if (
      this.options.mode !== AnimationMode.Hold &&
      (!this.running || this.finished)
    ) {
      return;
    }

    // Handle delay
    const delay = this.options.delay || 0;
    if (this.time < delay) {
      this.time += dt;
      if (this.time < delay) {
        return;
      }

      // If just passed the delay period, adjust dt to only use the leftover
      dt = this.time - delay;
      this.time = delay;
    }

    // Hold mode: if not running, reverse direction toward 0
    if (this.options.mode === AnimationMode.Hold) {
      this.running = true;
      if (this.holding) {
        this.direction = 1;
      } else {
        this.direction = -1;

        // If already at 0, do nothing
        if (this.progress <= 0) {
          this.reset();
          return;
        }
        // Always "run" when returning to 0
        // (so update continues until progress=0)
      }
    }

    // Calculate effective duration
    const duration = Math.max(1e-8, this.options.duration || 1);
    let progressDelta = (dt / duration) * this.direction;

    // Update progress
    let newProgress =
      this.options.mode === AnimationMode.Manual
        ? this.progress
        : this.progress + progressDelta;

    // Handle repeat modes
    const repeat =
      this.options.mode === AnimationMode.Hold
        ? RepeatMode.Once
        : this.options.repeat || RepeatMode.Once;
    const repeats = this.options.repeats || 0;
    let completed = false;

    if (repeat === RepeatMode.Once) {
      if (this.direction === 1 && newProgress >= 1) {
        newProgress = 1;
        completed = true;
      } else if (this.direction === -1 && newProgress <= 0) {
        newProgress = 0;
        completed = true;
      }
    } else if (repeat === RepeatMode.Loop) {
      if (this.direction === 1 && newProgress >= 1) {
        this.repeatCount++;
        this.options.onRepeat?.(this.repeatCount);
        if (repeats > 0 && this.repeatCount >= repeats) {
          newProgress = 1;
          completed = true;
        } else {
          newProgress = newProgress % 1;
        }
      } else if (this.direction === -1 && newProgress <= 0) {
        this.repeatCount++;
        this.options.onRepeat?.(this.repeatCount);
        if (repeats > 0 && this.repeatCount >= repeats) {
          newProgress = 0;
          completed = true;
        } else {
          newProgress = 1 + (newProgress % 1);
        }
      }
    } else if (repeat === RepeatMode.PingPong) {
      if (this.direction === 1 && newProgress >= 1) {
        this.direction = -1;
        this.repeatCount++;
        this.options.onRepeat?.(this.repeatCount);
        if (repeats > 0 && this.repeatCount >= repeats) {
          newProgress = 1;
          completed = true;
        } else {
          newProgress = 2 - newProgress; // reflect over 1
        }
      } else if (this.direction === -1 && newProgress <= 0) {
        this.direction = 1;
        this.repeatCount++;
        this.options.onRepeat?.(this.repeatCount);
        if (repeats > 0 && this.repeatCount >= repeats) {
          newProgress = 0;
          completed = true;
        } else {
          newProgress = -newProgress; // reflect over 0
        }
      }
    }

    // Clamp progress if needed
    if (this.options.clamp !== false) {
      newProgress = clamp(newProgress, 0, 1);
    }

    // Track if we moved away from progress=1 to reset the finished callback flag
    if (this.progress !== 1 && this.hasCalledFinishedCallback) {
      this.hasCalledFinishedCallback = false;
    }

    this.progress = newProgress;

    // Compute value (handle stops/keyframes)
    let value: T;
    const stops = this.options.stops;
    if (stops && stops.length > 0) {
      // Find the two stops surrounding progress
      let prev = { progress: 0, value: this.options.initialValue };
      let next = { progress: 1, value: this.options.targetValue };
      let reachedStopIndex = -1;

      for (let i = 0; i < stops.length; i++) {
        if (stops[i].progress <= this.progress) {
          prev = stops[i];
          if (Math.abs(stops[i].progress - this.progress) < 1e-6) {
            reachedStopIndex = i;
          }
        }
        if (stops[i].progress >= this.progress) {
          next = stops[i];
          if (Math.abs(stops[i].progress - this.progress) < 1e-6) {
            reachedStopIndex = i;
          }
          break;
        }
      }

      // Check for stops at exact progress values (0 and 1)
      if (Math.abs(this.progress - 0) < 1e-6) {
        const zeroStop = stops.find(s => Math.abs(s.progress - 0) < 1e-6);
        if (zeroStop) reachedStopIndex = stops.indexOf(zeroStop);
      } else if (Math.abs(this.progress - 1) < 1e-6) {
        const oneStop = stops.find(s => Math.abs(s.progress - 1) < 1e-6);
        if (oneStop) reachedStopIndex = stops.indexOf(oneStop);
      }

      // Call onStopReached callback if we hit a stop
      if (reachedStopIndex >= 0) {
        this.options.onStopReached?.(reachedStopIndex);
      }

      // If progress is before first stop
      if (this.progress <= prev.progress) {
        value = prev.value;
      } else if (this.progress >= next.progress) {
        value = next.value;
      } else {
        // Interpolate between prev and next
        value = this.interpolationFunction!(
          prev.value,
          next.value,
          (this.progress - prev.progress) / (next.progress - prev.progress)
        );
      }
    } else {
      // Simple interpolation between initial and target
      value = this.interpolationFunction!(
        this.options.initialValue,
        this.options.targetValue,
        this.progress
      );
    }

    // Apply easeAmount (exponential smoothing)
    if (this.options.easeAmount && this.options.easeAmount > 0) {
      const ease = clamp(this.options.easeAmount, 0, 1);
      // Blend previous value and new value
      if (isNumber(value) && isNumber(this.actualValue)) {
        value = ((1 - ease) * value + ease * (this.actualValue as number)) as T;
      } else if (isVec2(value) && isVec2(this.actualValue)) {
        value = {
          x: (1 - ease) * value.x + ease * (this.actualValue as any).x,
          y: (1 - ease) * value.y + ease * (this.actualValue as any).y,
        } as T;
      } else if (isVec3(value) && isVec3(this.actualValue)) {
        value = {
          x: (1 - ease) * value.x + ease * (this.actualValue as any).x,
          y: (1 - ease) * value.y + ease * (this.actualValue as any).y,
          z: (1 - ease) * value.z + ease * (this.actualValue as any).z,
        } as T;
      } else if (isColor(value) && isColor(this.actualValue)) {
        value = {
          r: (1 - ease) * value.r + ease * (this.actualValue as any).r,
          g: (1 - ease) * value.g + ease * (this.actualValue as any).g,
          b: (1 - ease) * value.b + ease * (this.actualValue as any).b,
          a:
            (1 - ease) * (value.a ?? 1) +
            ease * ((this.actualValue as any).a ?? 1),
        } as T;
      }
    }

    // Apply rounding if needed
    if (this.options.round) {
      if (typeof this.options.round === 'function') {
        value = this.options.round(value);
      } else if (this.options.round === true) {
        if (isNumber(value)) {
          value = Math.round(value) as T;
        } else if (isVec2(value)) {
          value = vec2.map(value, Math.round) as T;
        } else if (isVec3(value)) {
          value = vec3.map(value, Math.round) as T;
        } else if (isColor(value)) {
          value = {
            r: Math.round(value.r),
            g: Math.round(value.g),
            b: Math.round(value.b),
            a: value.a !== undefined ? Math.round(value.a) : undefined,
          } as T;
        }
      }
    }

    this.actualValue = value;

    // If animation is completed, stop it
    if (completed) {
      this.running = false;
      this.finished = true;
      if (!this.hasCalledFinishedCallback) {
        this.options.onFinished?.();
        this.hasCalledFinishedCallback = true;
      }
    }
  }
}

// -----------------------------------------------------------------------------
// MultiAnimation class
// -----------------------------------------------------------------------------

export class MultiAnimation<T extends { [K in keyof T]: AnimatableValue }> {
  private animations: Partial<{ [K in keyof T]: Animation<T[K]> }> = {};
  private _current: Partial<T> = {};

  public constructor(
    options: { _default?: Partial<AnimationOptions<any>> } & {
      [K in keyof T]?: {
        initialValue: T[K];
        targetValue: T[K];
      } & Partial<AnimationOptions<T[K]>>;
    }
  ) {
    const { _default, ...rest } = options;
    const restTyped = rest as Record<string, AnimationOptions<any>>;
    for (const key in restTyped) {
      if (Object.prototype.hasOwnProperty.call(restTyped, key)) {
        this.animations[key as keyof T] = new Animation({
          ...(_default || {}),
          ...restTyped[key],
        });
      }
    }
    this.updateCurrent();
  }

  private updateCurrent() {
    for (const key in this.animations) {
      if (this.animations[key as keyof T]) {
        (this._current as any)[key] = this.animations[key as keyof T]!.current;
      }
    }
  }

  public get current(): T {
    this.updateCurrent();
    return this._current as T;
  }

  public start() {
    for (const key in this.animations) {
      this.animations[key as keyof T]?.start();
    }
  }

  public stop() {
    for (const key in this.animations) {
      this.animations[key as keyof T]?.stop();
    }
  }

  public reset() {
    for (const key in this.animations) {
      this.animations[key as keyof T]?.reset();
    }
    this.updateCurrent();
  }

  public update(dt: number) {
    for (const key in this.animations) {
      this.animations[key as keyof T]?.update(dt);
    }
    this.updateCurrent();
  }
}

// -----------------------------------------------------------------------------
// Built-in easing functions
// -----------------------------------------------------------------------------

export const EasingFunctions: Record<string, EasingFunction> = {
  linear: t => t,
  'ease-in-quad': t => t * t,
  'ease-out-quad': t => t * (2 - t),
  'ease-in-out-quad': t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  'ease-in-cubic': t => t * t * t,
  'ease-out-cubic': t => --t * t * t + 1,
  'ease-in-out-cubic': t =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  'ease-in-quart': t => t * t * t * t,
  'ease-out-quart': t => 1 - --t * t * t * t,
  'ease-in-out-quart': t =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  'ease-in-quint': t => t * t * t * t * t,
  'ease-out-quint': t => 1 + --t * t * t * t * t,
  'ease-in-out-quint': t =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
  'ease-in-sine': t => 1 - Math.cos((t * Math.PI) / 2),
  'ease-out-sine': t => Math.sin((t * Math.PI) / 2),
  'ease-in-out-sine': t => -(Math.cos(Math.PI * t) - 1) / 2,
  'ease-in-expo': t => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  'ease-out-expo': t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  'ease-in-out-expo': t =>
    t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2,
  'ease-in-circ': t => 1 - Math.sqrt(1 - t * t),
  'ease-out-circ': t => Math.sqrt(1 - --t * t),
  'ease-in-out-circ': t =>
    t < 0.5
      ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
      : (Math.sqrt(1 - (2 * t - 2) * (2 * t - 2)) + 1) / 2,
  'ease-in-back': (t, magnitude = 1.70158) =>
    t * t * ((magnitude + 1) * t - magnitude),
  'ease-out-back': (t, magnitude = 1.70158) =>
    --t * t * ((magnitude + 1) * t + magnitude) + 1,
  'ease-in-out-back': (t, magnitude = 1.70158) => {
    const scaledTime = t * 2;
    const scaledTime2 = scaledTime - 2;
    const s = magnitude * 1.525;
    if (scaledTime < 1) {
      return 0.5 * scaledTime * scaledTime * ((s + 1) * scaledTime - s);
    }
    return 0.5 * (scaledTime2 * scaledTime2 * ((s + 1) * scaledTime2 + s) + 2);
  },
  'ease-in-elastic': (t, magnitude = 1, period = 0.3) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    let s;
    if (magnitude < 1) {
      magnitude = 1;
      s = period / 4;
    } else {
      s = (period / (2 * Math.PI)) * Math.asin(1 / magnitude);
    }
    return -(
      magnitude *
      Math.pow(2, 10 * (t - 1)) *
      Math.sin(((t - 1 - s) * (2 * Math.PI)) / period)
    );
  },
  'ease-out-elastic': (t, magnitude = 1, period = 0.3) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    let s;
    if (magnitude < 1) {
      magnitude = 1;
      s = period / 4;
    } else {
      s = (period / (2 * Math.PI)) * Math.asin(1 / magnitude);
    }
    return (
      magnitude *
        Math.pow(2, -10 * t) *
        Math.sin(((t - s) * (2 * Math.PI)) / period) +
      1
    );
  },
  'ease-in-out-elastic': (t, magnitude = 1, period = 0.45) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    let s;
    if (magnitude < 1) {
      magnitude = 1;
      s = period / 4;
    } else {
      s = (period / (2 * Math.PI)) * Math.asin(1 / magnitude);
    }
    const scaledTime = t * 2;
    if (scaledTime < 1) {
      return (
        -0.5 *
        (magnitude *
          Math.pow(2, 10 * (scaledTime - 1)) *
          Math.sin(((scaledTime - 1 - s) * (2 * Math.PI)) / period))
      );
    }
    return (
      magnitude *
        Math.pow(2, -10 * (scaledTime - 1)) *
        Math.sin(((scaledTime - 1 - s) * (2 * Math.PI)) / period) *
        0.5 +
      1
    );
  },
  'ease-in-bounce': (t, bounces = 4, decay = 2) =>
    1 - bounceOut(1 - t, bounces, decay),
  'ease-out-bounce': (t, bounces = 4, decay = 2) =>
    bounceOut(t, bounces, decay),
  'ease-in-out-bounce': (t, bounces = 4, decay = 2) =>
    t < 0.5
      ? (1 - bounceOut(1 - 2 * t, bounces, decay)) * 0.5
      : bounceOut(2 * t - 1, bounces, decay) * 0.5 + 0.5,
};

function bounceOut(t: number, bounces: number = 4, decay: number = 2): number {
  const pow = Math.pow(1 - t, decay);
  return 1 - Math.abs(Math.cos(t * Math.PI * bounces)) * pow;
}
