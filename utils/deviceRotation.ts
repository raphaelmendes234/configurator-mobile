import { DeviceMotionMeasurement } from 'expo-sensors';
import { clamp, radToDeg } from './math';

/**
 * Récupère l'inclinaison verticale (beta) entre 0 et 90°
 */
export function getVerticalAngle(motionData: DeviceMotionMeasurement | null | undefined) {
  if (!motionData || motionData.rotation.beta === undefined) return 0;
  return clamp(radToDeg(motionData.rotation.beta), 0, 90);
}

/**
 * Calcule l'angle horizontal relatif à une référence, limité entre -90° et 90°
 */
export function getHorizontalAngle(
  motionData: DeviceMotionMeasurement | null | undefined,
  refAngle: number | null
) {
  if (!motionData || motionData.rotation.alpha === undefined) return 0;
  const alphaDeg = radToDeg(motionData.rotation.alpha);

  if (refAngle === null) return 0;

  let diff = refAngle - alphaDeg;

  // Normaliser entre -180 et 180
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return clamp(diff, -90, 90);
}
