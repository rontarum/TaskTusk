import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function DonateButton() {
    const [isPressing, setIsPressing] = React.useState(false);

    return (
        <motion.button
            whileHover="hover"
            initial="initial"
            onMouseDown={() => setIsPressing(true)}
            onMouseUp={() => setIsPressing(false)}
            onMouseLeave={() => setIsPressing(false)}
            onClick={() => window.open("https://tips.yandex.ru/guest/payment/3586301", "_blank")}
            // Removed inline transition style that was clobbering the CSS transition for 'top'
            className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-2xl shadow-xs",
                "hover-elevate active-elevate-2 rubber-press",
                isPressing && "animate-rubber"
            )}
            style={{
                backgroundColor: "#FFF39A",
                color: "#FF883D",
            }}
            variants={{
                initial: {
                    backgroundColor: "#FFF39A",
                    color: "#FF883D",
                },
                hover: {
                    backgroundColor: "#FF883D",
                    color: "#FFF39A",
                }
            }}
            // Transition for framer-motion variants (colors)
            transition={{ duration: 0.15, ease: "easeOut" }}
            title="Поблагодарить"
            aria-label="Поблагодарить"
        >
            <motion.div
                variants={{
                    initial: {
                        rotate: 0,
                        y: 0,
                    },
                    hover: {
                        rotate: 360,
                        y: -16,
                    }
                }}
                transition={{
                    duration: 0.6,
                    ease: [0.33, 1, 0.68, 1] // cubic-bezier
                }}
                className="h-4 w-4 pointer-events-none"
                style={{
                    backgroundColor: "currentColor",
                    maskImage: "url(/coin.svg)",
                    WebkitMaskImage: "url(/coin.svg)",
                    maskSize: "contain",
                    maskRepeat: "no-repeat",
                    maskPosition: "center"
                }}
            />
        </motion.button>
    );
}
