import * as Haptics from 'expo-haptics';

export function SoftHaptic(){
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft) 
}

export function HeavyHaptic(){
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy) 
}

export function SuccessHaptic(){
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) 
}