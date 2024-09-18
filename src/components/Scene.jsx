import React, { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { OrbitControls } from "@react-three/drei";
import FallingBox from "./FallingBox";
import BlackPlane from "./BlackPlane";
import FallingTriangle from "./FallingTriangle";
import FallingSphere from "./FallingSphere"; // Importa el nuevo componente

const CameraSetup = () => {
	const { camera } = useThree();

	// Ajustamos la posición inicial de la cámara
	camera.position.set(10, 10, 0); // Coloca la cámara en [10, 10, 0]
	camera.rotation.x = Math.PI / -2; // Rota la cámara hacia abajo

	return null;
};

const Scene = () => {
	const [shapes, setShapes] = useState([]);
	const [boxCount, setBoxCount] = useState(0);
	const [triangleCount, setTriangleCount] = useState(0);
	const [sphereCount, setSphereCount] = useState(0);

	const generateRandomPosition = () => {
		return [Math.random() * 6 - 3, 5, Math.random() * 6 - 3];
	};

	const colorPalette = [
		"#f72585",
		"#b5179e",
		"#7209b7",
		"#560bad",
		"#480ca8",
		"#3a0ca3",
		"#3f37c9",
		"#4361ee",
		"#4895ef",
		"#4cc9f0",
	];

	const generateRandomColor = () => {
		const randomIndex = Math.floor(Math.random() * colorPalette.length);
		return colorPalette[randomIndex];
	};

	useEffect(() => {
		const interval = setInterval(() => {
			if (boxCount + triangleCount + sphereCount >= 15) {
				clearInterval(interval);
				return;
			}

			const shapeType =
				Math.random() > 0.66
					? "box"
					: Math.random() > 0.5
					? "triangle"
					: "sphere";

			if (shapeType === "box" && boxCount < 5) {
				setShapes((prevShapes) => [
					...prevShapes,
					{
						type: "box",
						position: generateRandomPosition(),
						color: generateRandomColor(),
					},
				]);
				setBoxCount((prevCount) => prevCount + 1);
			} else if (shapeType === "triangle" && triangleCount < 5) {
				setShapes((prevShapes) => [
					...prevShapes,
					{
						type: "triangle",
						position: generateRandomPosition(),
						color: generateRandomColor(),
					},
				]);
				setTriangleCount((prevCount) => prevCount + 1);
			} else if (shapeType === "sphere" && sphereCount < 5) {
				setShapes((prevShapes) => [
					...prevShapes,
					{
						type: "sphere",
						position: generateRandomPosition(),
						color: generateRandomColor(),
					},
				]);
				setSphereCount((prevCount) => prevCount + 1);
			}
		}, 5000); // Cada 5 segundos

		return () => clearInterval(interval);
	}, [boxCount, triangleCount, sphereCount]);

	return (
		<div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
			<Canvas>
				<ambientLight intensity={3} />
				<pointLight position={[10, 10, 10]} />
				<Physics>
					<BlackPlane />
					{shapes.map((shape, index) => {
						if (shape.type === "box") {
							return (
								<FallingBox
									key={index}
									initialPosition={shape.position}
									color={shape.color}
								/>
							);
						} else if (shape.type === "triangle") {
							return (
								<FallingTriangle
									key={index}
									initialPosition={shape.position}
									color={shape.color}
								/>
							);
						} else if (shape.type === "sphere") {
							return (
								<FallingSphere
									key={index}
									initialPosition={shape.position}
									color={shape.color}
								/>
							);
						}
						return null;
					})}
				</Physics>
				<OrbitControls
					enableZoom={true}
					enablePan={false}
					minDistance={2}
					maxDistance={10}
				/>
				<CameraSetup />
			</Canvas>
		</div>
	);
};

export default Scene;
