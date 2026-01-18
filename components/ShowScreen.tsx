import { useVideoPlayer, VideoView } from 'expo-video';
import { Dimensions, StyleSheet, View } from 'react-native';

const assetId = require('../assets/videos/mobile-show.mp4');

// Récupération des dimensions de l'écran pour un vrai plein écran
const { width, height } = Dimensions.get('window');

export function ShowScreen() {
  const player = useVideoPlayer(assetId, (player) => {
    player.loop = true;
    player.play();
    player.muted = true; // Optionnel : souvent nécessaire pour l'autoplay fluide
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen={false} // Désactive le bouton plein écran natif
        allowsPictureInPicture={false}
        nativeControls={false} // Cache les boutons play/pause/barre de progression
        contentFit="cover" // Important : remplit tout l'espace sans bandes noires
      />
      
      {/* Tu peux ajouter du contenu par-dessus la vidéo ici si besoin */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});