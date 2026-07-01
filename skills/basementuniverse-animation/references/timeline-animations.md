# AnimationTimeline Guide

`AnimationTimeline` sequences and coordinates multiple `Animation` and
`MultiAnimation` tracks.

## Create a timeline

```typescript
const timeline = new AnimationTimeline({
	mode: AnimationTimelineMode.Auto,
	durationMode: 'absolute', // or 'relative'
	duration: 10, // needed for relative mode
	onFinished: () => console.log('timeline finished'),
	onTrackStart: track => console.log('track start', track.label),
	onTrackEnd: track => console.log('track end', track.label),
	onMarkerReached: (marker, track) =>
		console.log('marker', marker.name, 'track', track.label),
});
```

## Add tracks

```typescript
timeline.addAnimation(fadeAnim, 0, 2, 'fade');
timeline.addAnimation(moveAnim, 1, 4, 'move');
timeline.addMultiAnimation(characterAnim, 3, 8, 'character');
```

If `end` is omitted, timeline computes it as `start + animation.duration`.

## Control and update

```typescript
timeline.start();
timeline.stop();
timeline.reset();

timeline.seek(3.5);
timeline.seekToProgress(0.5);

timeline.update(dt);
```

## Duration modes

- `absolute`: `start` and `end` are in seconds.
- `relative`: `start` and `end` are normalized `[0, 1]` against timeline
	`duration`.

## Data access

- `timeline.current` returns values for active tracks that have labels.
- `timeline.getTracksByLabel(label)` returns all matching tracks.
- `timeline.progress` provides normalized playhead and supports setting.

## Marker forwarding

For `Animation` tracks, marker callbacks are wrapped so both the animation-level
handler and timeline-level `onMarkerReached` can fire.

## Important behaviors

- Track activity window is inclusive at both bounds.
- In manual mode, `update(dt)` does not auto-advance `globalTime`.
- `seek` resets/stops tracks and re-evaluates at the new timeline position.
- Timeline `finished` toggles when crossing timeline duration end.

## Troubleshooting

- Relative mode timings feel wrong:
	- verify timeline `duration` is set correctly
- Track not in `current`:
	- confirm it is active and has a `label`
- Timeline appears idle:
	- verify mode and running state
	- in non-manual modes, call `start()` when mode is `Trigger`
