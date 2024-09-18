import React, { useState } from "react";
import { useSphere } from "@react-three/cannon"; // Importamos useSphere para física de cuerpos rígidos
import { useFrame } from "@react-three/fiber";

const FallingSphere = ({ initialPosition, color }) => {
	const [isClicked, setIsClicked] = useState(false);
	const [clickStartTime, setClickStartTime] = useState(0);
	const [clickDuration, setClickDuration] = useState(0);
	const upperLimit = 3; // Límite superior (techo)
	const sideLimit = 5; // Límite lateral

	// useSphere hook para crear un cuerpo rígido con física asociada a la esfera
	const [ref, api] = useSphere(() => ({
		mass: 1, // Definimos la masa de la esfera
		position: initialPosition, // Posición inicial
		onCollide: (e) => {
			// Detectar colisiones con otros objetos o el suelo
			if (e.contact.impactVelocity < 0.5) {
				api.velocity.set(0, 0, 0); // Reducir el rebote para colisiones suaves
			}
		},
	}));

	useFrame(() => {
		if (isClicked) {
			// Si la esfera está siendo clicada, calculamos la duración del clic
			const duration = (Date.now() - clickStartTime) / 1000;
			setClickDuration(duration);
		}

		// Limitar la posición de la esfera en el eje Y (techo) y los ejes X y Z (laterales)
		api.position.subscribe(([x, y, z]) => {
			// Límite superior
			if (y > upperLimit) {
				api.position.set(x, upperLimit, z);
				api.velocity.set(0, 0, 0); // Detener la esfera si alcanza el límite superior
			}
			// Límite lateral en X
			if (x > sideLimit) {
				api.position.set(sideLimit, y, z);
				api.velocity.set(0, 0, 0);
			} else if (x < -sideLimit) {
				api.position.set(-sideLimit, y, z);
				api.velocity.set(0, 0, 0);
			}
			// Límite lateral en Z
			if (z > sideLimit) {
				api.position.set(x, y, sideLimit);
				api.velocity.set(0, 0, 0);
			} else if (z < -sideLimit) {
				api.position.set(x, y, -sideLimit);
				api.velocity.set(0, 0, 0);
			}
		});
	});

	const handlePointerDown = () => {
		setClickStartTime(Date.now()); // Iniciamos el temporizador al hacer clic
		setIsClicked(true); // Cambiamos el estado para saber que está siendo clicado
	};

	const handlePointerUp = () => {
		setIsClicked(false); // Ya no está siendo clicado
		setClickStartTime(0);

		// Calculamos la fuerza a aplicar basada en la duración del clic
		const liftForce = 2 + clickDuration * 5; // El tiempo de clic afecta la magnitud de la fuerza hacia arriba

		// Aplicamos el impulso hacia arriba
		api.velocity.set(0, liftForce, 0);

		// Reiniciamos la duración del clic
		setClickDuration(0);
	};

	return (
		<mesh
			ref={ref} // Referencia al cuerpo rígido con físicas
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
		>
			<sphereGeometry args={[1, 32, 32]} /> {/* Geometría de la esfera */}
			<meshStandardMaterial color={color} /> {/* Material de la esfera */}
		</mesh>
	);
};

export default FallingSphere;
