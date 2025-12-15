// import { Canvas, Path, Skia } from "@shopify/react-native-skia";
// import { SharedValue, useDerivedValue } from "react-native-reanimated";

// type Props = {
//   width: number,
//   height: number,
//   selectedIndex: SharedValue<number>,
//   fingerPosX: SharedValue<number>,
//   fingerPosY: SharedValue<number>,
//   parts: number,
//   radius: number,
//   gutter: number, 
//   color: string
// };

// export function JoystickWheel({ width, height, selectedIndex, fingerPosX, fingerPosY, parts, radius, gutter, color }: Props) {
  
//   const animatedPath = useDerivedValue(() => {
//     console.log(selectedIndex.value)

//     const center = { x: fingerPosX.value, y: fingerPosY.value };
//     const path = Skia.Path.Make();

//     const fullAngle = 360;
//     const sliceAngle = fullAngle / parts;
//     const effectiveSweep = sliceAngle - gutter;

//     const circleRect = Skia.XYWHRect(
//       center.x - radius,
//       center.y - radius,
//       radius * 2,
//       radius * 2
//     );

//     for (let i = 0; i < parts; i++) {
//       const startDeg = sliceAngle * i + gutter / 2;

//       // Convertir en radians
//       const startRad = (startDeg * Math.PI) / 180;

//       // Point de départ de l'arc
//       const startX = center.x + Math.cos(startRad) * radius;
//       const startY = center.y + Math.sin(startRad) * radius;

//       const p = Skia.Path.Make();

//       // Centre → début du cercle
//       p.moveTo(center.x, center.y);

//       p.lineTo(startX, startY);

//       // Ajouter l'arc de la part
//       p.addArc(circleRect, startDeg, effectiveSweep);

//       // Fermer (revient au centre)
//       p.lineTo(center.x, center.y);
      
//       // Fusionner dans le path final
//       path.addPath(p);
//     }

//     return path;
//   }, [ fingerPosX, fingerPosY, parts, radius, gutter]);

//   return (
//     <Canvas style={{ flex: 1, position: "absolute", top: 0, left: 0, height: height, width: width }}>
//       <Path
//         path={animatedPath}
//         color={color}
//         style="stroke"
//         strokeWidth={3}
//       />
//     </Canvas>
//   );
// }

import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

type Props = {
  width: number;
  height: number;
  selectedIndex: SharedValue<number>;
  fingerPosX: SharedValue<number>;
  fingerPosY: SharedValue<number>;
  parts: number;
  radius: number;
  gutter: number;
  color: string;
  bgColor: string; // Nouvelle prop pour la couleur active
};

export function JoystickWheel({
  width,
  height,
  selectedIndex,
  fingerPosX,
  fingerPosY,
  parts,
  radius,
  gutter,
  color,
  bgColor,
}: Props) {
  
  // Fonction utilitaire pour créer la géométrie d'une part
  const createSlicePath = (
    index: number,
    center: { x: number; y: number },
    sliceAngle: number,
    effectiveSweep: number,
    bonusSize: number,
  ) => {
    "worklet"; // Important pour Reanimated
    const startDeg = sliceAngle * index + gutter / 2;
    const startRad = (startDeg * Math.PI) / 180;
    const startX = center.x + Math.cos(startRad) * radius;
    const startY = center.y + Math.sin(startRad) * radius;

    const p = Skia.Path.Make();
    p.moveTo(center.x, center.y);
    p.lineTo(startX, startY);
    
    const circleRect = Skia.XYWHRect(
      center.x - radius - bonusSize*.5, // Ajout de la size bonus pour faire dépasser la roue d'arrière plan (et créer des bordures)
      center.y - radius - bonusSize*.5,
      radius * 2 + bonusSize,
      radius * 2 + bonusSize
    );
    
    p.addArc(circleRect, startDeg, effectiveSweep);
    p.lineTo(center.x, center.y);
    p.close();

    return p;
  };

  // 1. Chemin pour les parts NON sélectionnées
  const normalPath = useDerivedValue(() => {
    const center = { x: fingerPosX.value, y: fingerPosY.value };
    const path = Skia.Path.Make();

    const fullAngle = 360;
    const sliceAngle = fullAngle / parts;
    const effectiveSweep = sliceAngle + gutter ; // + gutter pour élargir la part noire et éviter le bug de bordures, car 

    for (let i = 0; i < parts; i++) {
      // On saute l'index sélectionné
      // if (i !== selectedIndex.value) {
        const p = createSlicePath(i, center, sliceAngle, effectiveSweep, 0);
        path.addPath(p);
      // }
    }
    return path;
  }, [fingerPosX, fingerPosY, parts, radius, gutter, selectedIndex]);

  // 2. Chemin pour la part SÉLECTIONNÉE uniquement
  const selectedPath = useDerivedValue(() => {
    const center = { x: fingerPosX.value, y: fingerPosY.value };
    const path = Skia.Path.Make();
    
    // Si aucun index n'est sélectionné (ex: -1), on retourne un chemin vide
    if (selectedIndex.value < 0 || selectedIndex.value >= parts) return path;

    const fullAngle = 360;
    const sliceAngle = fullAngle / parts;
    const effectiveSweep = sliceAngle - gutter;

    // Pas besoin de boucle ici, on dessine juste l'index spécifique
    const p = createSlicePath(selectedIndex.value, center, sliceAngle, effectiveSweep, 0);
    path.addPath(p);

    return path;
  }, [fingerPosX, fingerPosY, parts, radius, gutter, selectedIndex]);


  // 1. Chemin pour les parts avec bordure
  const strokePath = useDerivedValue(() => {
    const center = { x: fingerPosX.value, y: fingerPosY.value };
    const path = Skia.Path.Make();

    const fullAngle = 360;
    const sliceAngle = fullAngle / parts;
    const effectiveSweep = sliceAngle - gutter;

    for (let i = 0; i < parts; i++) {
      // On saute l'index sélectionné
      if (i !== selectedIndex.value) {
        const p = createSlicePath(i, center, sliceAngle, effectiveSweep, 4);
        path.addPath(p);
      }
    }
    return path;
  }, [fingerPosX, fingerPosY, parts, radius, gutter, selectedIndex]);

  return (
    <Canvas
      style={{
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        height: height,
        width: width,
      }}
    >
      {/* Rendu des parts avec bordure */}
      <Path
        path={strokePath}
        color={color}
        style="fill"
        strokeWidth={3}
        strokeJoin="round" 
      />

      {/* Rendu des parts normales */}
      <Path
        path={normalPath}
        color={bgColor}
        style="fill"
        strokeWidth={3}
        strokeJoin="round" 
      />
      
      {/* Rendu de la part active (par dessus) */}
      <Path
        path={selectedPath}
        color={color}
        style="fill" // Ou "fill" selon l'effet désiré
        strokeWidth={3} 
        strokeJoin="round"
      />
    </Canvas>
  );
}