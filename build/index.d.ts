import { vec2, vec3 } from '@basementuniverse/vec';
type Color = {
    r: number;
    g: number;
    b: number;
    a?: number;
};
type AnimatableValue = number | vec2 | vec3 | Color;
type EasingFunction = (t: number, ...args: any[]) => number;
export declare enum AnimationMode {
    /**
     * Animation starts automatically when created
     */
    Auto = "auto",
    /**
     * Animation starts when triggered manually by calling the `start` method
     */
    Trigger = "trigger",
    /**
     * Animation plays while triggered, and reverses when not triggered
     */
    Hold = "hold",
    /**
     * Animation is controlled manually by setting the progress
     */
    Manual = "manual"
}
export declare enum RepeatMode {
    /**
     * Animation will play once and then stop
     */
    Once = "once",
    /**
     * Animation will loop indefinitely
     */
    Loop = "loop",
    /**
     * Animation will play forward and then reverse, repeating indefinitely
     */
    PingPong = "pingpong"
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
    interpolationFunction?: keyof typeof EasingFunctions | ((a: T, b: T, i: number, ...params: any[]) => T);
    /**
     * Optional parameters to pass to the interpolation function
     */
    interpolationFunctionParameters?: any[];
};
export declare class Animation<T extends AnimatableValue = number> {
    private static readonly DEFAULT_OPTIONS;
    private time;
    private actualValue;
    private options;
    private interpolationFunction?;
    private direction;
    private repeatCount;
    private finished;
    progress: number;
    running: boolean;
    holding: boolean;
    constructor(options: AnimationOptions<T>);
    private getInterpolationFunction;
    get current(): T;
    start(): void;
    stop(): void;
    reset(): void;
    update(dt: number): void;
}
export declare class MultiAnimation<T extends {
    [K in keyof T]: AnimatableValue;
}> {
    private animations;
    private _current;
    constructor(options: {
        _default?: Partial<AnimationOptions<any>>;
    } & {
        [K in keyof T]?: AnimationOptions<T[K]>;
    });
    private updateCurrent;
    get current(): T;
    start(): void;
    stop(): void;
    reset(): void;
    update(dt: number): void;
}
export declare const EasingFunctions: Record<string, EasingFunction>;
export {};
