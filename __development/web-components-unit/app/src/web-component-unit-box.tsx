import { useEffect, useRef } from "react";

const audioContext = new AudioContext();

export const WebComponentUnitBox = ({ tagName }: { tagName: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const element = document.createElement(tagName);
    console.group({ element });
    (element as any).setupUnit({ some: "args", audioContext });
    elementRef.current = element;
    containerRef.current.appendChild(element);
    return () => {
      if (elementRef.current && containerRef.current) {
        containerRef.current.removeChild(elementRef.current);
      }
    };
  }, [tagName]);
  return <div ref={containerRef} style={{ width: "400px", height: "400px" }} />;
};
