import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import FallingBox from "./FallingBox";
import BlackPlane from "./BlackPlane";
import FallingTriangle from "./FallingTriangle";

const Scene = () => {
	// Controla las figuras generadas
	const [shapes, setShapes] = useState([]);
	const [boxCount, setBoxCount] = useState(0);
	const [triangleCount, setTriangleCount] = useState(0);

	const generateRandomPosition = () => {
		return [Math.random() * 6 - 3, 5, Math.random() * 6 - 3];
	};

	const generateRandomColor = () => {
		const letters = "0123456789ABCDEF";
		let color = "#";
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	};

	useEffect(() => {
		const interval = setInterval(() => {
			// Si ya hay 5 cubos y 5 triángulos, no agregues más figuras
			if (boxCount + triangleCount >= 10) {
				clearInterval(interval);
				return;
			}

			// Seleccionar aleatoriamente entre cubo y triángulo
			const shapeType = Math.random() > 0.5 ? "box" : "triangle";

			// Añadir la figura si no se ha alcanzado el límite para esa forma
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
			}
		}, 8000); // Cada 8 segundos

		// Limpia el intervalo cuando el componente se desmonta
		return () => clearInterval(interval);
	}, [boxCount, triangleCount]);

	return (
		<div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
			<Canvas>
				<ambientLight intensity={0.5} />
				<pointLight position={[10, 10, 10]} />
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
					}
					return null;
				})}
				<OrbitControls />
				<perspectiveCamera position={[0, 5, 10]} />
			</Canvas>
		</div>
	);
};

export default Scene;
