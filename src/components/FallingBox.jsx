import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const fallingBoxes = [];

const FallingBox = ({ initialPosition, color }) => {
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
	const boxSize = 1;

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

			// Apply gravity
			newVelocity += gravity;

			// Apply lift force if the box was clicked
			if (!isClicked && clickDuration > 0) {
				newVelocity = initialLiftForce + clickDuration * liftIncreaseRate;
				setClickDuration(0);
			}

			// Calculate new position
			newY += newVelocity;

			// Check collision with ceiling
			if (newY >= upperLimit) {
				newY = upperLimit;
				newVelocity *= bounceCoefficient; // Invert and reduce velocity
			}

			// Check collision with ground
			if (newY <= lowerLimit) {
				newY = lowerLimit;
				newVelocity = 0;
			}

			// Update position and velocity
			const newPosition = [newX, newY, newZ];
			setPosition(newPosition);
			setVelocity(newVelocity);

			// Update mesh position
			meshRef.current.position.set(newX, newY, newZ);

			// Calculate bounding box and check for collisions with other boxes
			const box = new THREE.Box3().setFromObject(meshRef.current);

			for (const otherBox of fallingBoxes) {
				if (otherBox !== meshRef.current) {
					const otherBox3 = new THREE.Box3().setFromObject(otherBox);

					if (box.intersectsBox(otherBox3)) {
						// Resolve collision by moving the box away in a direction
						const intersection = box.intersect(otherBox3);
						const overlapX = Math.abs(intersection.max.x - intersection.min.x);
						const overlapY = Math.abs(intersection.max.y - intersection.min.y);
						const overlapZ = Math.abs(intersection.max.z - intersection.min.z);

						// Move the box to the side to avoid overlap
						if (overlapX > overlapY && overlapX > overlapZ) {
							newX =
								position[0] +
								(position[0] < otherBox.position.x ? -1 : 1) *
									(boxSize / 2 + overlapX / 2);
						} else if (overlapY > overlapZ) {
							newY =
								position[1] +
								(position[1] < otherBox.position.y ? -1 : 1) *
									(boxSize / 2 + overlapY / 2);
						} else {
							newZ =
								position[2] +
								(position[2] < otherBox.position.z ? -1 : 1) *
									(boxSize / 2 + overlapZ / 2);
						}

						setPosition([newX, newY, newZ]);
					}
				}
			}
		}
	});

	useEffect(() => {
		// Register the box in the global array
		fallingBoxes.push(meshRef.current);
		return () => {
			const index = fallingBoxes.indexOf(meshRef.current);
			if (index > -1) {
				fallingBoxes.splice(index, 1);
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
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color={color} />
		</mesh>
	);
};

export default FallingBox;
