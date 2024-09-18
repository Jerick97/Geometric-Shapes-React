import React from "react";
import { usePlane } from "@react-three/cannon";

const BlackPlane = () => {
	// Creamos el plano con físicas
	const [ref] = usePlane(() => ({
		rotation: [-Math.PI / 2, 0, 0], // Orientación del plano horizontal
		position: [0, -3, 0], // Colocamos el plano en el nivel del suelo
	}));

	return (
		<mesh ref={ref} receiveShadow>
			<planeGeometry args={[10, 10]} />
			<meshStandardMaterial color="white" />
		</mesh>
	);
};

export default BlackPlane;
