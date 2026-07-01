# MultiAnimation Guide

`MultiAnimation` groups multiple named `Animation` instances and updates them
together.

## Constructor pattern

```typescript
const multi = new MultiAnimation({
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
	position: {
		initialValue: { x: 100, y: 100 },
		targetValue: { x: 600, y: 600 },
	},
});
```

## Common operations

```typescript
multi.start();
multi.stop();
multi.reset();
multi.update(dt);

multi.holding = true; // propagates to children
multi.progress = 0.5; // sets child progress directly

const values = multi.current;
```

## Behavior notes

- `_default` is merged into each child animation definition.
- Each key creates a separate `Animation` instance.
- `.current` is a snapshot object with the same keys.
- Use per-child overrides when some tracks need different durations/repeats.

## Practical pattern

Use one multi animation per game object and separate channels by concern:

- transform channels: `position`, `rotation`, `scale`
- visual channels: `color`, `alpha`
- gameplay channels: `chargeAmount`, `recoil`

This keeps update and consumption code predictable in frame loops.

## Troubleshooting

- Child value not changing:
	- verify that child has both `initialValue` and `targetValue` (or valid stops)
	- verify `.update(dt)` is called
- `.holding` appears ineffective:
	- confirm child mode is `AnimationMode.Hold`
- Manual scrub not reflected:
	- after setting `multi.progress`, read `multi.current` again
