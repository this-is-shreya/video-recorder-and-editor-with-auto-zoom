import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Transition6({svgFile}) {
  const currentMask = useRef(1);
  const imageRef = useRef(null);

  const swapMask = () => {
    currentMask.current =
      currentMask.current === 3 ? 1 : currentMask.current + 1;

    if (imageRef.current) {
      gsap.set(imageRef.current, {
        attr: {
          href: `/assets/liquidMask${currentMask.current}.svg`,
        },
      });
    }
  };

  useEffect(() => {
    const tl = gsap.timeline({ onComplete: swapMask });

    tl.fromTo(
      imageRef.current,
      { y: 0 },
      {
        y: -10266, // Height of the sprite sheet for full animation
        duration: 1,
        ease: "steps(29)",
        onComplete: () => {
          // Hide the mask image to avoid black screen after the animation
          gsap.set(imageRef.current, { opacity: 0 });
        },
      }
    );
  }, []);

  return (
    <div
      className="liquid-mask-overlay"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
        backgroundColor: "transparent"
      }}
    >
      <svg
        viewBox="0 0 630 352"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        <mask id="liquidMask">
          <image
            ref={imageRef}
            className="m maskImage"
            href={`/assets/${svgFile}`}
            y="-1"
            width="630"
            height="10620"
          />
        </mask>
        <rect width="630" height="420" fill="white" mask="url(#liquidMask)" />
      </svg>
    </div>
  );
}
