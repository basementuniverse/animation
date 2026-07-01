# Easing Functions

All built-ins are available via `EasingFunctions`.

```typescript
type EasingFunction = (t: number, ...args: any[]) => number;
```

- `t` is expected in `[0, 1]` for normal operation.
- Some easings support overshoot/oscillation and are often paired with
	`clamp: false`.

## Linear

- `linear(t)`

## Polynomial

- `ease-in-quad(t)`
- `ease-out-quad(t)`
- `ease-in-out-quad(t)`
- `ease-in-cubic(t)`
- `ease-out-cubic(t)`
- `ease-in-out-cubic(t)`
- `ease-in-quart(t)`
- `ease-out-quart(t)`
- `ease-in-out-quart(t)`
- `ease-in-quint(t)`
- `ease-out-quint(t)`
- `ease-in-out-quint(t)`

## Trigonometric / Exponential / Circular

- `ease-in-sine(t)`
- `ease-out-sine(t)`
- `ease-in-out-sine(t)`
- `ease-in-expo(t)`
- `ease-out-expo(t)`
- `ease-in-out-expo(t)`
- `ease-in-circ(t)`
- `ease-out-circ(t)`
- `ease-in-out-circ(t)`

## Back

- `ease-in-back(t, magnitude = 1.70158)`
- `ease-out-back(t, magnitude = 1.70158)`
- `ease-in-out-back(t, magnitude = 1.70158)`

`magnitude` controls overshoot strength.

## Elastic

- `ease-in-elastic(t, magnitude = 1, period = 0.3)`
- `ease-out-elastic(t, magnitude = 1, period = 0.3)`
- `ease-in-out-elastic(t, magnitude = 1, period = 0.45)`

Parameters:

- `magnitude`: oscillation amplitude
- `period`: oscillation period/frequency feel

## Bounce

- `ease-in-bounce(t, bounces = 4, decay = 2)`
- `ease-out-bounce(t, bounces = 4, decay = 2)`
- `ease-in-out-bounce(t, bounces = 4, decay = 2)`

Parameters:

- `bounces`: bounce count
- `decay`: how quickly bounce magnitude decays

## Usage examples

```typescript
// Named easing
const anim = new Animation({
	initialValue: 0,
	targetValue: 100,
	interpolationFunction: 'ease-out-elastic',
	interpolationFunctionParameters: [1, 0.5],
});

// Custom interpolation
const custom = new Animation({
	initialValue: 0,
	targetValue: 100,
	interpolationFunction: (a, b, t) => a + (b - a) * Math.pow(t, 3),
});
```
