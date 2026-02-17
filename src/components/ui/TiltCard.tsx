import * as React from "react";
import VanillaTilt, { TiltOptions } from "vanilla-tilt";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
    options?: TiltOptions;
    children: React.ReactNode;
    disabled?: boolean;
}

interface TiltElement extends HTMLDivElement {
  vanillaTilt?: { destroy: () => void };
}

export const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
    ({ options, children, className, disabled, ...props }, ref) => {
        const localRef = React.useRef<HTMLDivElement>(null);

        // Merge ref
        React.useImperativeHandle(ref, () => localRef.current!);

        React.useEffect(() => {
            const element = localRef.current;
            // Disable tilt on mobile devices to prevent layout interference and save battery
            // Using matchMedia for better reactivity if needed, but simple check is fine here
            const checkMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
            const isMobile = checkMobile();

            if (element && !isMobile && !disabled) {
                VanillaTilt.init(element, {
                    reverse: true,
                    max: 10,
                    speed: 600,
                    glare: true,
                    "max-glare": 0.12,
                    perspective: 10000,
                    scale: 1.00,
                    easing: "cubic-bezier(.06,.96,.63, 0.96)",
                    gyroscope: true,
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
        }, [options, disabled]);

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
