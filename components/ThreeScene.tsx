import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { useEffect, useRef } from "react";
import { SharedValue } from "react-native-reanimated";
import {
    AmbientLight,
    Fog,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Plane,
    PointLight,
    Raycaster,
    Scene,
    SphereGeometry,
    Vector2,
    Vector3,
} from "three";


type Props = {
    fingerPosX: SharedValue<number>,
    fingerPosY: SharedValue<number>,
    colorIndex: SharedValue<number>,
}

export default function ThreeScene({fingerPosX, fingerPosY, colorIndex}:Props){

    // GLView dimensions
    const viewWidth = useRef(1);
    const viewHeight = useRef(1)

    let timeout: number;

    useEffect(() => {
        return () => clearTimeout(timeout);
    }, []);

    const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
        const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;

        const renderer = new Renderer({ gl });
        renderer.setSize(w, h);
        renderer.setClearColor(0x6ad6f0);

        const camera = new PerspectiveCamera(70, w / h, 0.01, 1000);

        camera.position.set(0, 10, 0);
        camera.lookAt(0, 0, 0);

        const scene = new Scene();
        scene.fog = new Fog("0x6ad6f0", 1, 10000);
        // scene.add(new GridHelper(20, 20));

        const ambientLight = new AmbientLight(0x404040, 10)
        scene.add(ambientLight);

        const pointLight = new PointLight(0xffffff, 5, 20, 1);
        pointLight.position.set(0, 10, 0);
        scene.add(pointLight);

        const geometry = new SphereGeometry(1, 32, 32);
        
        const colors = [
            0xffffff, // Blanc
            0xff0000, // Rouge
            0x00ff00, // Vert
            0x0000ff, // Bleu
            0xffff00, // Jaune
            0xff00ff  // Magenta
        ];

        const material = new MeshStandardMaterial({color: colors[0]});
        const sphere = new Mesh(geometry, material);
        scene.add(sphere);
        
        //
        // 🔥 RAYCAST SETUP
        //
        const raycaster = new Raycaster();
        const pointer = new Vector2();
        const plane = new Plane(new Vector3(0, 1, 0), 0); // y=0
        const intersection = new Vector3();

        function update() {
            // écran → coordonnées NDC
            pointer.x = (fingerPosX.value / viewWidth.current) * 2 - 1;
            pointer.y = -(fingerPosY.value / viewHeight.current) * 2 + 1;

            // lancer le rayon
            raycaster.setFromCamera(pointer, camera);

            // intersection avec le sol
            if (raycaster.ray.intersectPlane(plane, intersection)) {
                sphere.position.x = intersection.x;
                sphere.position.z = intersection.z;
            }
  
            sphere.material.color.setHex(colors[colorIndex.value]);
            sphere.material.needsUpdate = true;

        }

        const render = () => {
            timeout = requestAnimationFrame(render);
            update();
            renderer.render(scene, camera);
            gl.endFrameEXP();
        };

        render();
    };

    return (
        <GLView 
            style={{ flex: 1 }} 
            onContextCreate={onContextCreate} 
            onLayout={e => {
            viewWidth.current = e.nativeEvent.layout.width;
            viewHeight.current = e.nativeEvent.layout.height;
            }}
        />
    )
}