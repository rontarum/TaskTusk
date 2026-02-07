import React, { useEffect } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useVelocity,
    useTime,
} from "framer-motion";

export const ParallaxFlower = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 18, stiffness: 120, mass: 1.9 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    const velocityX = useVelocity(smoothX);
    const velocityY = useVelocity(smoothY);

    const scaleXComputed = useTransform([velocityX, velocityY], ([vx, vy]) => {
        const k = 0.0002;
        return 1 + Math.abs(vx as number) * k - Math.abs(vy as number) * k;
    });

    const scaleYComputed = useTransform([velocityX, velocityY], ([vx, vy]) => {
        const k = 0.0002;
        return 1 + Math.abs(vy as number) * k - Math.abs(vx as number) * k;
    });

    // Sinusoidal rotation effect
    const time = useTime();
    const rotateComputed = useTransform(time, (t) => {
        // T is in ms. We want a slow rotation.
        // Math.sin takes radians. Let's make it rotate +/- 90 degrees (180 total range)
        return Math.sin(t / 2000) * 90;
    });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = e.clientX - innerWidth / 2;
            const y = e.clientY - innerHeight / 2;

            // Reversing direction or keeping it same? User said "exactly like tasktusk"
            // Let's keep the movement factor same.
            // Negating values to move opposite to the mouse direction
            mouseX.set(-x / 20);
            mouseY.set(-y / 20);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            style={{
                x: smoothX,
                y: smoothY,
                scaleX: scaleXComputed,
                scaleY: scaleYComputed,
            }}
            // Positioned in top-left, under header (which is usually h-16 = 64px)
            // Using absolute/fixed positioning. User said "left top corner (under header)"
            className="fixed top-20 left-4 w-[360px] h-auto pointer-events-none z-0 opacity-80 hidden lg:block"
        >
            <motion.div
                style={{
                    rotate: rotateComputed,
                }}
                className="w-full h-full"
            >
                <img src="/flower.svg" alt="" className="w-full h-auto" />
            </motion.div>
        </motion.div>
    );
};
