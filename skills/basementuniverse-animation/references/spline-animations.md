# Spline Animations

Use spline interpolation when you want curved spatial paths for vec2/vec3
values.

## Available helpers

- `bezierPath(options)`
- `catmullRomPath(options)`

Both return interpolation functions compatible with `Animation`.

## Bezier paths

```typescript
const animation = new Animation({
	initialValue: { x: 0, y: 0 },
	targetValue: { x: 100, y: 100 },
	duration: 2,
	interpolationFunction: bezierPath({
		points: [
			{ x: 0.25, y: 0.8 },
			{ x: 0.75, y: 0.2 },
		],
		order: 3,
		relative: 'start-end',
		useAnimationEndpoints: true,
	}),
});
```

### Bezier constraints

- `order` must be `1 | 2 | 3`.
- Total control points must be exactly `order + 1`.
- With `useAnimationEndpoints: true`, total points are:
	- linear: 2 (`a`, `b`)
	- quadratic: 3 (`a`, one custom, `b`)
	- cubic: 4 (`a`, two custom, `b`)

## Catmull-Rom paths

```typescript
const animation = new Animation({
	initialValue: { x: 50, y: 250 },
	targetValue: { x: 450, y: 250 },
	duration: 4,
	interpolationFunction: catmullRomPath({
		points: [
			{ x: 150, y: 100 },
			{ x: 250, y: 400 },
			{ x: 350, y: 100 },
		],
		tension: 0.5,
		relative: 'none',
	}),
});
```

### Catmull-Rom constraints

- Requires at least 2 total points after endpoint handling.
- With 2 points, it falls back to linear interpolation.
- `tension` default is `0.5`.

## Relative modes

- `'none'`: points are absolute coordinates.
- `'start'`: points are offsets from `initialValue`.
- `'start-end'`: points are normalized within the start-to-end span.

`'start-end'` is ideal for reusable path shapes across different world-space
start/end pairs.

## Scalar restriction

Both spline helpers throw when used with scalar `number` animations. They are
for vec2/vec3 only.

## Troubleshooting

- Error about control point count:
	- align `points` + `useAnimationEndpoints` with required total
- Path shape inverted/unexpected:
	- verify `relative` mode assumptions
- No motion:
	- confirm `initialValue` and `targetValue` are vectors and `update(dt)` runs
