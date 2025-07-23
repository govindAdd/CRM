import React, { useRef, useEffect } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Animation,
  Mesh,
  PointLight,
} from '@babylonjs/core';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    engineRef.current = engine;

    const scene = new Scene(engine);
    sceneRef.current = scene;

    scene.clearColor = new Color3(0.02, 0.02, 0.05);

    const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);
    camera.wheelDeltaPercentage = 0.01;
    camera.setTarget(Vector3.Zero());

    const hemisphericLight = new HemisphericLight("hemisphericLight", new Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.4;

    const directionalLight = new DirectionalLight("directionalLight", new Vector3(-1, -0.5, -1), scene);
    directionalLight.intensity = 0.8;
    directionalLight.diffuse = new Color3(1, 1, 1);

    const pointLight = new PointLight("pointLight", new Vector3(0, 2, 0), scene);
    pointLight.intensity = 1.2;
    pointLight.diffuse = new Color3(0.3, 0.8, 1);

    const create404Text = () => {
      const textMeshes = [];

      const four1 = MeshBuilder.CreateBox("four1", { width: 0.5, height: 3, depth: 0.3 }, scene);
      four1.position = new Vector3(-3, 0, 0);

      const four2 = MeshBuilder.CreateBox("four2", { width: 2, height: 0.5, depth: 0.3 }, scene);
      four2.position = new Vector3(-2.25, 0.5, 0);

      const four3 = MeshBuilder.CreateBox("four3", { width: 0.5, height: 1.5, depth: 0.3 }, scene);
      four3.position = new Vector3(-1.5, 0.75, 0);

      const zero = MeshBuilder.CreateTorus("zero", { diameter: 2.5, thickness: 0.5 }, scene);
      zero.position = new Vector3(0, 0, 0);

      const four4 = MeshBuilder.CreateBox("four4", { width: 0.5, height: 3, depth: 0.3 }, scene);
      four4.position = new Vector3(3, 0, 0);

      const four5 = MeshBuilder.CreateBox("four5", { width: 2, height: 0.5, depth: 0.3 }, scene);
      four5.position = new Vector3(3.75, 0.5, 0);

      const four6 = MeshBuilder.CreateBox("four6", { width: 0.5, height: 1.5, depth: 0.3 }, scene);
      four6.position = new Vector3(4.5, 0.75, 0);

      textMeshes.push(four1, four2, four3, zero, four4, four5, four6);

      textMeshes.forEach((mesh, index) => {
        const material = new StandardMaterial(`textMaterial${index}`, scene);
        material.diffuseColor = new Color3(0.2, 0.6, 1);
        material.specularColor = new Color3(1, 1, 1);
        material.emissiveColor = new Color3(0.1, 0.3, 0.6);
        mesh.material = material;
      });

      return textMeshes;
    };

    const textMeshes = create404Text();

    const createFloatingObjects = () => {
      const objects = [];

      for (let i = 0; i < 15; i++) {
        let mesh;
        const objectType = Math.floor(Math.random() * 3);

        switch (objectType) {
          case 0:
            mesh = MeshBuilder.CreateBox(`floatingBox${i}`, { size: 0.5 }, scene);
            break;
          case 1:
            mesh = MeshBuilder.CreateSphere(`floatingSphere${i}`, { diameter: 0.6 }, scene);
            break;
          default:
            mesh = MeshBuilder.CreateTorus(`floatingTorus${i}`, { diameter: 0.8, thickness: 0.2 }, scene);
            break;
        }

        mesh.position = new Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 20
        );

        mesh.rotation = new Vector3(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );

        const material = new StandardMaterial(`floatingMaterial${i}`, scene);
        material.diffuseColor = new Color3(
          0.3 + Math.random() * 0.7,
          0.3 + Math.random() * 0.7,
          0.3 + Math.random() * 0.7
        );
        material.specularColor = new Color3(1, 1, 1);
        mesh.material = material;

        objects.push(mesh);
      }

      return objects;
    };

    const floatingObjects = createFloatingObjects();

    const createAnimations = () => {
      textMeshes.forEach((mesh) => {
        const animationY = new Animation("animationY", "position.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        const keys = [
          { frame: 0, value: mesh.position.y },
          { frame: 60, value: mesh.position.y + 0.5 },
          { frame: 120, value: mesh.position.y }
        ];
        animationY.setKeys(keys);
        mesh.animations.push(animationY);
        scene.beginAnimation(mesh, 0, 120, true, 1);

        const animationRotation = new Animation("animationRotation", "rotation.z", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        const rotationKeys = [
          { frame: 0, value: 0 },
          { frame: 180, value: Math.PI * 0.1 },
          { frame: 360, value: 0 }
        ];
        animationRotation.setKeys(rotationKeys);
        mesh.animations.push(animationRotation);
        scene.beginAnimation(mesh, 0, 360, true, 0.5);
      });

      floatingObjects.forEach((mesh, index) => {
        const animationRotationX = new Animation("animationRotationX", "rotation.x", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        animationRotationX.setKeys([
          { frame: 0, value: mesh.rotation.x },
          { frame: 120, value: mesh.rotation.x + Math.PI * 2 }
        ]);
        mesh.animations.push(animationRotationX);

        const animationRotationY = new Animation("animationRotationY", "rotation.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        animationRotationY.setKeys([
          { frame: 0, value: mesh.rotation.y },
          { frame: 100, value: mesh.rotation.y + Math.PI * 2 }
        ]);
        mesh.animations.push(animationRotationY);

        scene.beginAnimation(mesh, 0, 120, true, 0.3 + Math.random() * 0.5);
      });
    };

    createAnimations();

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

      camera.alpha = -Math.PI / 2 + mouseX * 0.2;
      camera.beta = Math.PI / 2.5 + mouseY * 0.1;

      floatingObjects.forEach((mesh, index) => {
        const offset = index * 0.1;
        mesh.position.x += Math.sin(Date.now() * 0.001 + offset) * 0.001;
        mesh.position.z += Math.cos(Date.now() * 0.001 + offset) * 0.001;
      });
    };

    canvasRef.current.addEventListener('mousemove', handleMouseMove);

    scene.onPointerMove = (event, pickResult) => {
      if (pickResult.hit && pickResult.pickedMesh) {
        const mesh = pickResult.pickedMesh;
        if (floatingObjects.includes(mesh)) {
          mesh.scaling = Vector3.Lerp(mesh.scaling, new Vector3(1.2, 1.2, 1.2), 0.1);
        }
      }

      floatingObjects.forEach(mesh => {
        if (pickResult.pickedMesh !== mesh) {
          mesh.scaling = Vector3.Lerp(mesh.scaling, new Vector3(1, 1, 1), 0.1);
        }
      });
    };

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ outline: 'none' }} />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 right-8 pointer-events-auto">
          <div className="flex justify-between items-center">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Go Back
            </button>
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 backdrop-blur-sm rounded-lg border border-blue-400/30 text-blue-200 hover:bg-blue-600/30 transition-all duration-300 group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Home
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 right-8 text-center pointer-events-auto">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8 max-w-2xl mx-auto">
            <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Oops!
            </h1>
            <h2 className="text-2xl font-semibold text-blue-200 mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              The page you're looking for seems to have drifted into another dimension. 
              Don't worry though, you can navigate back to safety using the controls above.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Take Me Back
              </button>
              <button
                onClick={handleGoHome}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-8 transform -translate-y-1/2 pointer-events-none">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <p className="text-sm text-gray-300">Move your mouse to explore the 3D space</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
