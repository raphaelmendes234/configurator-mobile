import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Hook pour récupérer les données de mouvement du téléphone
 */
export function useMotionData() {
  const [motionData, setMotionData] = useState<DeviceMotionMeasurement | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    DeviceMotion.setUpdateInterval(100);

    const subscription = DeviceMotion.addListener((data) => {
      setMotionData(data);
    });

    return () => subscription.remove();
  }, []);

  return motionData;
}
