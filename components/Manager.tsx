import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { connect, disconnect } from '../utils/websocket';

import { CalibrationProvider } from '@/contexts/CalibrationContext';
import { IntroScreen } from './IntroScreen';
import { JoystickScreen } from './JoystickScreen';
import { OutroScreen } from './OutroScreen';
import { ShowScreen } from './ShowScreen';
import { SlingshotScreen } from './SlingshotScreen';
import { TitleScreen } from './TitleScreen';
import { WaitingScreen } from './WaitingScreen';

type GamePhase = "waiting" | "title" | "intro" | "select" | "throw" | "show" | "outro" | "loading";

const Manager: React.FC = () => {
  // État pour la phase de jeu (initialisé sur 'loading')
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 💡 Fonction de rappel (Callback) pour traiter les messages reçus
  const handleMessage = useCallback((data: string) => {
    setErrorMessage(null); // Réinitialiser l'erreur à la réception d'un nouveau message

    // Assurez-vous que le message est bien une des phases attendues
    if (['waiting', 'title', 'intro', 'select', 'throw', 'show', 'outro'].includes(data)) {
      setPhase(data as GamePhase); // Met à jour la phase de jeu
      console.log(`Changement de phase : ${data}`);
    } else {
      console.log(`Other message : ${data}`);
    }
  }, []);

  // 💡 Effet pour gérer la connexion et la déconnexion
  useEffect(() => {
    // Établit la connexion en passant la fonction de mise à jour d'état
    connect(handleMessage);

    // Fonction de nettoyage : s'exécute lorsque le composant est démonté
    return () => {
      disconnect(); 
      // Si la connexion se ferme, on pourrait aussi réinitialiser la phase ici :
      // setPhase("loading"); 
    };
  }, [handleMessage]); // handleMessage est stable grâce à useCallback

  // 💡 Rendu conditionnel des composants
  const CurrentComponent = useMemo(() => {
    switch (phase) {
      case 'waiting':
        return WaitingScreen;
      case 'title':
        return TitleScreen;
      case 'intro':
        return IntroScreen;
      case 'select':
        return JoystickScreen;
      case 'throw':
        return SlingshotScreen;
      case 'show':
        return ShowScreen;
      case 'outro':
        return OutroScreen;
      default:
        return WaitingScreen;
    }
  }, [phase]);

  return (
    <CalibrationProvider>
      <View style={styles.container}>
        <Text style={styles.status}>Phase Actuelle: {phase.toUpperCase()}</Text>
        
        {/* 4. Affichage du composant sélectionné */}
        <CurrentComponent />

        {/* Affichage des erreurs si elles existent */}
        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

        {/* Exemple d'interaction pour tester l'envoi */}
        {/* <Button title="Envoyer 'start'" onPress={() => sendMessage("start")} /> */}
        {/* --- Section de Contrôle des Phases (Boutons) --- */}
        <View style={styles.controls}>
          <Text style={styles.controlTitle}>Contrôle Dev/Test :</Text>
          
          {/* On crée un tableau des phases pour itérer */}
          {(['waiting', 'start', 'select', 'throw', 'end'] as GamePhase[]).map((p) => (
            <View key={p} style={styles.buttonWrapper}>
              <Button
                title={p.toUpperCase()}
                // 💡 L'action du bouton appelle directement setPhase
                onPress={() => setPhase(p)}
                color={phase === p ? '#4CAF50' : '#2196F3'} // Couleur verte si c'est la phase active
                disabled={phase === p}
              />
            </View>
          ))}
        </View>
      </View>
    </CalibrationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
  },
  loading: {
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginTop: 10,
    fontWeight: 'bold',
  },
  controls: {
    marginTop: 40,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row', // Pour aligner les boutons horizontalement
    flexWrap: 'wrap', // Pour permettre le retour à la ligne
    justifyContent: 'center',
  },
  controlTitle: {
    width: '100%',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  buttonWrapper: {
    margin: 5,
    minWidth: 80, // Assurer que les boutons ont une taille minimale
  }
});

export default Manager;