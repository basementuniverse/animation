---
name: basementuniverse-animation
description: >
  Use and troubleshoot the @basementuniverse/animation TypeScript library
  for value animation in HTML5 games. Use when implementing, debugging, or
  documenting animation behaviour driven by this package.
---

# Basement Universe Animation

Use this skill when working with `@basementuniverse/animation`.

This package animates values over time (numbers, vectors, colors). It does not
render anything. Consumers use animated values for position, rotation, scale,
colors, and other gameplay/UI state.

## When to use

Use this skill for:

- Creating or updating `Animation`, `MultiAnimation`, or `AnimationTimeline`
  usage.
- Choosing interpolation/easing functions and parameters.
- Designing markers, keyframe stops, repeat behaviour, and manual scrubbing.
- Troubleshooting issues like callbacks not firing, values not changing, or
  timeline tracks not activating.

Do not use this skill for:

- Rendering concerns (Canvas/WebGL draw loops, shaders, sprite systems).
- Physics or collision logic unrelated to animation value generation.

## Workflow

1. Identify which abstraction the user needs:
   - single value stream: `Animation`
   - grouped named values: `MultiAnimation`
   - scheduled orchestration: `AnimationTimeline`
2. Confirm control model:
   - automatic (`Auto`/`Trigger`) update via `update(dt)`
   - hold-driven (`Hold`)
   - externally controlled (`Manual` via `progress`/`globalTime`)
3. Pick interpolation strategy:
   - named easing for scalar/vector/color interpolation
   - custom interpolation function
   - spline interpolation via `bezierPath` / `catmullRomPath` for vec2/vec3
4. Apply timing features only if needed:
   - `delay`, `repeat`, `repeats`, keyframe `stops`, `markers`
5. Validate with a frame loop assumption:
   - `update(dt)` where `dt` is seconds
   - verify `progress`, `current`, callbacks, and repeat counts

## Troubleshooting checklist

- Nothing moves:
  - verify `.update(dt)` is called
  - verify animation is running (`Auto` or explicit `.start()`)
  - verify `dt` is in seconds
- Unexpected stop:
  - check `repeat`/`repeats`
  - check `finished`, `running`, `direction`
- Marker not firing:
  - check `time` vs `progress` precedence
  - check marker `direction`, `once`, and `global`
  - check if animation crossed marker in current update span
- Timeline track never activates:
  - validate track start/end against timeline `durationMode`
  - for relative mode, ensure timeline `duration` is provided
- Spline errors:
  - ensure values are vec2/vec3 (not numbers)
  - ensure point counts match bezier order or Catmull-Rom minimums

## References

- Public API surface: [references/api.md](references/api.md)
- Type reference: [references/types.md](references/types.md)
- Built-in easing functions: [references/easing-functions.md](references/easing-functions.md)
- Multi animation patterns: [references/multi-animations.md](references/multi-animations.md)
- Spline interpolation: [references/spline-animations.md](references/spline-animations.md)
- Timeline orchestration: [references/timeline-animations.md](references/timeline-animations.md)
