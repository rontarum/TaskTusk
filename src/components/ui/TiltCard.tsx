import * as React from "react";
import VanillaTilt, { TiltOptions } from "vanilla-tilt";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
    options?: TiltOptions;
    children: React.ReactNode;
}

interface TiltElement extends HTMLDivElement {
  vanillaTilt?: { destroy: () => void };
}

export const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
    ({ options, children, className, ...props }, ref) => {
        const localRef = React.useRef<HTMLDivElement>(null);

        // Merge ref
        React.useImperativeHandle(ref, () => localRef.current!);

        React.useEffect(() => {
            const element = localRef.current;
            if (element) {
                VanillaTilt.init(element, {
                    reverse: true, // Reversed tilt direction
                    max: 10, // Increased tilt angle for more movement
                    speed: 600, // Slower transition for "antimagnetic" smoothness
                    glare: true,
                    "max-glare": 0.12,
                    perspective: 10000, // High perspective eliminates idle shifts
                    scale: 1.00,
                    easing: "cubic-bezier(.06,.96,.63, 0.96)", // Elastic but smooth easing
                    gyroscope: true, // Enable gyroscope for mobile devices
                    gyroscopeMinAngleX: -45,
                    gyroscopeMaxAngleX: 45,
                    gyroscopeMinAngleY: -45,
                    gyroscopeMaxAngleY: 45,
                    ...options,
                });
            }

            return () => {
                if (element && (element as TiltElement).vanillaTilt) {
                    (element as TiltElement).vanillaTilt.destroy();
                }
            };
        }, [options]);

        return (
            <div
                ref={localRef}
                className={cn("tilt-card", className)}
                {...props}
                style={{
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                    ...props.style
                }}
            >
                {children}
            </div>
        );
    }
);

TiltCard.displayName = "TiltCard";
