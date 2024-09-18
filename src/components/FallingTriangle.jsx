import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const fallingTriangles = [];

const FallingTriangle = ({ initialPosition, color }) => {
	const meshRef = useRef(null);
	const [position, setPosition] = useState(initialPosition);
	const [velocity, setVelocity] = useState(0);
	const [isClicked, setIsClicked] = useState(false);
	const [clickStartTime, setClickStartTime] = useState(0);
	const [clickDuration, setClickDuration] = useState(0);

	const gravity = -0.01;
	const initialLiftForce = 0.2;
	const liftIncreaseRate = 0.05;
	const upperLimit = 3;
	const lowerLimit = -2;
	const bounceCoefficient = -0.5;
	const triangleSize = 1; // Tamaño del triángulo

	useEffect(() => {
		if (isClicked) {
			setClickStartTime(Date.now());
		} else if (clickStartTime) {
			setClickDuration((Date.now() - clickStartTime) / 1000);
			setClickStartTime(0);
		}
	}, [isClicked]);

	useFrame(() => {
		if (meshRef.current) {
			let newVelocity = velocity;
			let newY = position[1];
			let newX = position[0];
			let newZ = position[2];

			// Aplicar gravedad
			newVelocity += gravity;

			// Aplicar fuerza de elevación si el triángulo fue clicado
			if (!isClicked && clickDuration > 0) {
				newVelocity = initialLiftForce + clickDuration * liftIncreaseRate;
				setClickDuration(0);
			}

			// Calcular nueva posición
			newY += newVelocity;

			// Verificar colisión con el límite superior
			if (newY >= upperLimit) {
				newY = upperLimit;
				newVelocity *= bounceCoefficient; // Invertir y reducir la velocidad
			}

			// Verificar colisión con el suelo
			if (newY <= lowerLimit) {
				newY = lowerLimit;
				newVelocity = 0;
			}

			// Actualizar posición y velocidad
			const newPosition = [newX, newY, newZ];
			setPosition(newPosition);
			setVelocity(newVelocity);

			// Actualizar la posición del triángulo
			meshRef.current.position.set(newX, newY, newZ);

			// Calcular caja delimitadora y verificar colisiones con otros triángulos
			const triangle = new THREE.Box3().setFromObject(meshRef.current);

			for (const otherTriangle of fallingTriangles) {
				if (otherTriangle !== meshRef.current) {
					const otherBox3 = new THREE.Box3().setFromObject(otherTriangle);

					if (triangle.intersectsBox(otherBox3)) {
						// Resolver la colisión moviendo el triángulo
						const intersection = triangle.intersect(otherBox3);
						const overlapX = Math.abs(intersection.max.x - intersection.min.x);
						const overlapY = Math.abs(intersection.max.y - intersection.min.y);
						const overlapZ = Math.abs(intersection.max.z - intersection.min.z);

						// Mover el triángulo a un lado para evitar la superposición
						if (overlapX > overlapY && overlapX > overlapZ) {
							newX =
								position[0] +
								(position[0] < otherTriangle.position.x ? -1 : 1) *
									(triangleSize / 2 + overlapX / 2);
						} else if (overlapY > overlapZ) {
							newY =
								position[1] +
								(position[1] < otherTriangle.position.y ? -1 : 1) *
									(triangleSize / 2 + overlapY / 2);
						} else {
							newZ =
								position[2] +
								(position[2] < otherTriangle.position.z ? -1 : 1) *
									(triangleSize / 2 + overlapZ / 2);
						}

						setPosition([newX, newY, newZ]);
					}
				}
			}
		}
	});

	useEffect(() => {
		// Registrar el triángulo en el array global
		fallingTriangles.push(meshRef.current);
		return () => {
			const index = fallingTriangles.indexOf(meshRef.current);
			if (index > -1) {
				fallingTriangles.splice(index, 1);
			}
		};
	}, []);

	return (
		<mesh
			ref={meshRef}
			position={position}
			onPointerDown={() => setIsClicked(true)}
			onPointerUp={() => setIsClicked(false)}
		>
			{/* Usar coneGeometry para simular un triángulo 3D */}
			<coneGeometry args={[1, 1, 3]} />
			<meshStandardMaterial color={color} />
		</mesh>
	);
};

export default FallingTriangle;
