// Clamp
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Convert
export function radToDeg(rad: number) {
  return rad * (180 / Math.PI);
}