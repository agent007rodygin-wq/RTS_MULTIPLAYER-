/**
 * Isometric Water Ripple & Leaping Fish rendering for Basingse river fishing spots.
 * Matches authentic water circle ripples and dynamic fish jumping effect.
 */

export function drawFishingSpotRipple(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  time: number,
  zoom: number,
  spotSeed: number = 0
) {
  ctx.save();
  ctx.translate(screenX, screenY);

  const baseRadiusX = 24 * zoom;
  const baseRadiusY = 12 * zoom; // isometric 2:1 ratio

  // 1. Concentric animated ripple waves (3 staggered wave cycles)
  const wavePeriod = 2200; // ms per wave pulse
  for (let i = 0; i < 3; i++) {
    const waveOffset = (time + i * 730 + spotSeed * 100) % wavePeriod;
    const progress = waveOffset / wavePeriod; // 0 to 1

    const rx = baseRadiusX * (0.3 + progress * 0.9);
    const ry = baseRadiusY * (0.3 + progress * 0.9);
    const alpha = Math.sin(progress * Math.PI) * (1 - progress * 0.45);

    ctx.strokeStyle = `rgba(224, 242, 254, ${Math.max(0, alpha * 0.75)})`;
    ctx.lineWidth = Math.max(1, (2.2 - progress * 1.2) * zoom);

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 2. Bright core center ring (seen clearly in screenshot)
  const corePulse = 1 + Math.sin(time * 0.005) * 0.15;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = Math.max(1.5, 2.5 * zoom);
  ctx.shadowColor = 'rgba(56, 189, 248, 0.75)';
  ctx.shadowBlur = 8 * zoom;

  ctx.beginPath();
  ctx.ellipse(0, 0, 8 * zoom * corePulse, 4 * zoom * corePulse, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 3. Floating water glitter/mote (like in the screenshot top-right)
  const sparkAngle = (time * 0.0015 + spotSeed) % (Math.PI * 2);
  const sparkX = Math.cos(sparkAngle) * (20 * zoom);
  const sparkY = Math.sin(sparkAngle) * (10 * zoom) - 4 * zoom;
  const sparkAlpha = 0.4 + Math.sin(time * 0.008) * 0.4;

  ctx.fillStyle = `rgba(254, 240, 138, ${sparkAlpha})`;
  ctx.beginPath();
  ctx.arc(sparkX, sparkY, Math.max(1.5, 2.2 * zoom), 0, Math.PI * 2);
  ctx.fill();

  // 4. Leaping Fish Animation (jumps out of water periodically!)
  const fishCyclePeriod = 6500; // jumps every 6.5 seconds
  const fishElapsed = (time + spotSeed * 1337) % fishCyclePeriod;
  const jumpDuration = 1100; // jump lasts 1.1s

  if (fishElapsed < jumpDuration) {
    const jumpProgress = fishElapsed / jumpDuration; // 0 to 1
    // Parabolic arc: 0 -> peak -> 0
    const jumpHeight = Math.sin(jumpProgress * Math.PI) * (42 * zoom);
    const fishX = (jumpProgress - 0.5) * (28 * zoom);
    const fishY = -jumpHeight;
    const fishAngle = (jumpProgress - 0.5) * 1.8; // rotates from nose-up to nose-down

    ctx.save();
    ctx.translate(fishX, fishY);
    ctx.rotate(fishAngle);

    // Fish silhouette with shiny scale reflection
    const fishLen = 14 * zoom;
    const fishThick = 5 * zoom;

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(0, 0, fishLen, fishThick, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail fin
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(fishLen * 0.7, 0);
    ctx.lineTo(fishLen * 1.3, -fishThick * 1.2);
    ctx.lineTo(fishLen * 1.3, fishThick * 1.2);
    ctx.closePath();
    ctx.fill();

    // Fish eye
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-fishLen * 0.6, -fishThick * 0.3, Math.max(1, 1.4 * zoom), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Splashes at emergence and entry
    if (jumpProgress < 0.15 || jumpProgress > 0.85) {
      const splashAlpha = jumpProgress < 0.15 ? (1 - jumpProgress / 0.15) : ((jumpProgress - 0.85) / 0.15);
      ctx.fillStyle = `rgba(224, 242, 254, ${splashAlpha * 0.8})`;
      for (let s = -2; s <= 2; s++) {
        ctx.beginPath();
        ctx.arc(s * 4 * zoom, -2 * zoom - Math.abs(s) * 3 * zoom, Math.max(1, 1.8 * zoom), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
