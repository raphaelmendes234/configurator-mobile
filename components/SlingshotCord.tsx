import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

type Props = {
  width: number;
  height: number;
  safeArea: number;
  fingerPosX: SharedValue<number>;
  fingerPosY: SharedValue<number>;
  circleSize: number;
};

export function SlingshotCord({
  width,
  height,
  safeArea,
  fingerPosX,
  fingerPosY,
  circleSize,
}: Props) {
  const path = useDerivedValue(() => {
    const path = Skia.Path.Make();
    path.moveTo(0, safeArea);
    path.lineTo(width, safeArea);
    path.close();
    return path;
  });

  const animatedPath = useDerivedValue(() => {
    const p = Skia.Path.Make();

    const startY = safeArea * 0.5;
    const x = fingerPosX.value;
    const y = fingerPosY.value + circleSize * 0.5 + 2;

    // Départ à gauche
    p.moveTo(0, startY);

    // control point 1
    const ax = 75;
    const ay = startY - 25;

    // control point 2
    const bx = x - width / 2;
    const by = y;

    p.cubicTo(ax, ay, bx, by, x, y);

    // control point 3
    const cx = x + width / 2;
    const cy = y;

    const dx = width - 75;
    const dy = startY - 25;

    p.cubicTo(cx, cy, dx, dy, width, startY);

    return p;
  }, [fingerPosX, fingerPosY]);

  const strength = useDerivedValue(() => {
    // Origine où la force = 0
    const referenceY = safeArea;

    // Distance verticale depuis la référence
    const distanceY = Math.max(fingerPosY.value - referenceY, 0); // jamais négatif

    // Normalisation : on peut considérer que la force maximale = hauteur disponible
    const maxDistance = height - referenceY;
    return Math.min(distanceY / maxDistance, 1); // 0 à 1
  });

  const cordColor = useDerivedValue(() => {
    const s = strength.value; // 0 -> vert, 1 -> rouge

    const r = Math.floor(217 + (255 - 217) * s); // 217 -> 255
    const g = Math.floor(242 - 242 * s); // 242 -> 0
    const b = Math.floor(3 - 3 * s); // 3 -> 0

    return `rgb(${r},${g},${b})`;
  });

  return (
    <Canvas style={{ flex: 1 }}>
      <Path
        path={animatedPath}
        style="stroke"
        strokeWidth={4}
        color={cordColor}
      />
      {/* <Path
        path={path}
        color="#daf2033f"
        style="stroke"
        strokeWidth={4}
      /> */}
    </Canvas>
  );
}
