# API Reference

Source of truth: `index.ts`.

## Package import

```typescript
import {
	Animation,
	MultiAnimation,
	AnimationTimeline,
	AnimationMode,
	RepeatMode,
	MarkerDirection,
	EasingFunctions,
	bezierPath,
	catmullRomPath,
	type AnimationOptions,
	type AnimationTimelineOptions,
	type Marker,
	type TimelineTrack,
	type BezierPathOptions,
	type CatmullRomPathOptions,
} from '@basementuniverse/animation';
```

## Enums

### AnimationMode

- `Auto = 'auto'`
- `Trigger = 'trigger'`
- `Hold = 'hold'`
- `Manual = 'manual'`

### RepeatMode

- `Once = 'once'`
- `Loop = 'loop'`
- `PingPong = 'pingpong'`

### MarkerDirection

- `Forward = 'forward'`
- `Backward = 'backward'`
- `Both = 'both'`

### AnimationTimelineMode

- `Auto = 'auto'`
- `Trigger = 'trigger'`
- `Manual = 'manual'`

## Core classes

### Animation

```typescript
new Animation<T>(
	options: {
		initialValue: T;
		targetValue: T;
	} & Partial<AnimationOptions<T>>
)
```

#### Public properties

- `progress: number`
- `running: boolean`
- `holding: boolean`
- `direction: number` (`1` forward, `-1` backward)
- `repeatCount: number`
- `finished: boolean`
- `current: T` (getter)
- `markers: Marker[] | undefined` (getter)
- `animationOptions: AnimationOptions<T>` (getter)

#### Public methods

- `start(): void`
- `stop(): void`
- `reset(): void`
- `update(dt: number): void`

#### Defaults

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
	interpolationFunctionParameters: [],
}
```

#### Behaviour notes

- `dt` is expected in seconds.
- In `Hold` mode, repeat mode is forced to `Once` internally.
- `Manual` mode does not advance `progress` automatically; value recomputation
	still occurs in `update`.
- `onFinished` is guarded to avoid duplicate calls while sitting at the end.
- `clamp: false` allows overshoot progress outside `[0, 1]`.

### MultiAnimation

```typescript
new MultiAnimation<T extends { [K in keyof T]: AnimatableValue }>(
	options: {
		_default?: Partial<AnimationOptions<any>>;
	} & {
		[K in keyof T]?: {
			initialValue: T[K];
			targetValue: T[K];
		} & Partial<AnimationOptions<T[K]>>;
	}
)
```

#### Public properties

- `holding: boolean` (getter/setter)
- `progress: number` (setter)
- `current: T` (getter)

#### Public methods

- `start(): void`
- `stop(): void`
- `reset(): void`
- `update(dt: number): void`

#### Behaviour notes

- `_default` is merged into each named animation option set.
- Setting `.progress` sets progress on child animations directly.

### AnimationTimeline

```typescript
new AnimationTimeline(options?: Partial<AnimationTimelineOptions>)
```

#### Public properties

- `globalTime: number`
- `running: boolean`
- `finished: boolean`
- `duration: number` (getter)
- `progress: number` (getter/setter)
- `current: { [key: string]: any }` (getter; values from active labeled tracks)

#### Public methods

- `addAnimation<T>(animation: Animation<T>, start: number, end?: number, label?: string): void`
- `addMultiAnimation<T>(animation: MultiAnimation<T>, start: number, end?: number, label?: string): void`
- `getTracksByLabel(label: string): TimelineTrack[]`
- `start(): void`
- `stop(): void`
- `reset(): void`
- `seek(time: number): void`
- `seekToProgress(progress: number): void`
- `update(dt: number): void`

#### Defaults

```typescript
{
	mode: AnimationTimelineMode.Auto,
	durationMode: 'absolute',
}
```

#### Behaviour notes

- In `relative` duration mode, `duration` should be provided.
- Track active window is inclusive: `globalTime >= start && globalTime <= end`.
- Marker forwarding to timeline callbacks is wired for `Animation` tracks.

## Interpolation utilities

### EasingFunctions

```typescript
const EasingFunctions: Record<string, (t: number, ...args: any[]) => number>
```

See full list and parameters in `references/easing-functions.md`.

### bezierPath

```typescript
function bezierPath<T extends vec2 | vec3>(
	options: BezierPathOptions<T>
): (a: T, b: T, i: number) => T
```

- Throws for scalar (`number`) animation values.

### catmullRomPath

```typescript
function catmullRomPath<T extends vec2 | vec3>(
	options: CatmullRomPathOptions<T>
): (a: T, b: T, i: number) => T
```

- Throws for scalar (`number`) animation values.
- Requires at least 2 total points after endpoint handling.
