# Type Reference

## Value types

```typescript
import { vec2, vec3 } from '@basementuniverse/vec';

type Color = {
	r: number;
	g: number;
	b: number;
	a?: number;
};

type AnimatableValue = number | vec2 | vec3 | Color;
```

`Color` and `AnimatableValue` are used internally and in generics; they are not
exported as named types from this package.

## Marker

```typescript
export type Marker = {
	time?: number;
	progress?: number;
	name?: string;
	direction?: MarkerDirection;
	once?: boolean;
	global?: boolean;
	callback: (marker: Marker) => void;
};
```

Notes:

- If both `time` and `progress` are provided, `time` takes precedence.
- `direction` default is `MarkerDirection.Both`.
- `once` means once per repeat loop boundary.
- `global` means once for animation lifetime.

## AnimationOptions

```typescript
export type AnimationOptions<T extends AnimatableValue> = {
	initialValue: T;
	targetValue: T;
	mode: AnimationMode;
	repeat: RepeatMode;
	repeats: number;
	duration: number;
	delay?: number;
	clamp?: boolean;
	round?: boolean | ((value: T) => T);
	easeAmount?: number;
	stops?: { progress: number; value: T }[];
	interpolationFunction?:
		| keyof typeof EasingFunctions
		| ((a: T, b: T, i: number, ...params: any[]) => T);
	interpolationFunctionParameters?: any[];
	onFinished?: () => void;
	onRepeat?: (count: number) => void;
	onStopReached?: (index: number) => void;
	markers?: Marker[];
	onMarkerReached?: (marker: Marker) => void;
};
```

## MultiAnimation constructor shape

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

## Timeline types

```typescript
export type TimelineTrack = {
	animation: Animation<any> | MultiAnimation<any>;
	label?: string;
	start: number;
	end?: number;
};

export type AnimationTimelineOptions = {
	mode?: AnimationTimelineMode;
	durationMode?: 'absolute' | 'relative';
	duration?: number;
	onFinished?: () => void;
	onTrackStart?: (track: TimelineTrack) => void;
	onTrackEnd?: (track: TimelineTrack) => void;
	onMarkerReached?: (marker: Marker, track: TimelineTrack) => void;
};
```

## Spline option types

```typescript
export type BezierPathOptions<T extends vec2 | vec3 = vec2> = {
	points: T[];
	order: 1 | 2 | 3;
	relative?: 'none' | 'start' | 'start-end';
	useAnimationEndpoints?: boolean;
};

export type CatmullRomPathOptions<T extends vec2 | vec3 = vec2> = {
	points: T[];
	tension?: number;
	relative?: 'none' | 'start' | 'start-end';
	useAnimationEndpoints?: boolean;
};
```
