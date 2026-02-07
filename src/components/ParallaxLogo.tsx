import React, { useEffect } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useVelocity,
    useTime,
} from "framer-motion";

export const ParallaxLogo = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out the mouse movement with a spring
    // Adjusted for more inertia and "life": lower stiffness, slightly lower damping relative to mass
    const springConfig = { damping: 18, stiffness: 80, mass: 1.2 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    // Calculate velocity of the smoothed movement
    // We'll use this for squash-and-stretch
    const velocityX = useVelocity(smoothX);
    const velocityY = useVelocity(smoothY);

    // Transform velocity into scale
    // Moving fast horizontally -> stretch X, squash Y
    // Moving fast vertically -> stretch Y, squash X
    const scaleX = useTransform(velocityX, [-1000, 0, 1000], [1.1, 1, 1.1]);
    const scaleY = useTransform(velocityY, [-1000, 0, 1000], [1.1, 1, 1.1]);

    // Combine independent axis scaling.
    // When calculate scale based on total velocity magnitude for a more unified deformation?
    // Let's keep it simple first:
    // If moving right (pos velocity), scaleX > 1.
    // To preserve area somewhat, we might want to invert the other axis, but let's see how independent feels.
    // Actually, standard squash/stretch: if we stretch X, we should squash Y.
    // Let's try to couple them a bit.
    const skewX = useTransform(velocityX, [-1000, 1000], [10, -10]);
    const skewY = useTransform(velocityY, [-1000, 1000], [10, -10]);

    // Let's refine the scale to be more subtle and purely based on "stretching in direction of movement"
    // For a logo, maybe just a slight positional parallax is safer, but user asked for "squash-n-stretch".

    // Let's look at the "springy/alive" feel.
    // A simple way is to map velocity to scale.
    // Implementation:
    // scaleX = 1 + abs(velocityX) * k - abs(velocityY) * k
    // scaleY = 1 + abs(velocityY) * k - abs(velocityX) * k

    const scaleXComputed = useTransform([velocityX, velocityY], ([vx, vy]) => {
        const k = 0.0002; // sensitivity
        return 1 + Math.abs(vx as number) * k - Math.abs(vy as number) * k;
    });

    const scaleYComputed = useTransform([velocityX, velocityY], ([vx, vy]) => {
        const k = 0.0002;
        return 1 + Math.abs(vy as number) * k - Math.abs(vx as number) * k;
    });

    // Sinusoidal rotation
    const time = useTime();
    const rotateComputed = useTransform(time, (t) => {
        // Base -6 tilt + sin oscillation (faster than flower, 12 degree amplitude)
        return -6 + Math.sin(t / 800) * 12;
    });


    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Calculate position relative to center of screen
            const { innerWidth, innerHeight } = window;
            const x = e.clientX - innerWidth / 2;
            const y = e.clientY - innerHeight / 2;

            // Update motion values
            // We divide by a factor to reduce the movement range (parallax effect)
            mouseX.set(x / 15);
            mouseY.set(y / 15);
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
                // skewX: skewX, // Maybe too much? let's stick to scale first
                // skewY: skewY,
            }}
            className="fixed bottom-0 right-0 w-[800px] h-auto pointer-events-none z-0 opacity-100 hidden lg:block"
        >
            {/*
            We need to apply the static transforms that were on the parent div in Index.tsx
            translate-y-[-25%] translate-x-[-12%] rotate-[-6deg]
            We can apply these via CSS or style prop.
            Since we are using motion.div for x/y, we should probably mix them.

            However, x and y in style will override translate-x/y classes regarding the motion.
            But the original had `translate-x-[-12%]` which is a static offset.
            Motion `x` adds a translation in pixels.

            To combine them, we can put the static transforms on an inner element?
            Or just use style={{ x, y, rotate: -6, translateX: "-12%", translateY: "-25%" }}
         */}
            <motion.div
                style={{
                    rotate: rotateComputed,
                    translateX: "-12%",
                    translateY: "-25%"
                }}
                className="w-full h-full"
            >
                <img src="/tasktusk.svg" alt="" className="w-full h-auto" />
            </motion.div>
        </motion.div>
    );
};
