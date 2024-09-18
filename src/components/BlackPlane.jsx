import React from "react";

const BlackPlane = () => {
	return (
		<mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[10, 10]} />
			<meshStandardMaterial color="#d3b897" />
		</mesh>
	);
};

export default BlackPlane;
