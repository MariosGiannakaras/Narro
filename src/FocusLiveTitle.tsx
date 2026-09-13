import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import "./focusLiveTitle.css";

type FocusLiveTitleProps = {
  title: string;
  scrollingEnabled: boolean;
};

type LiveTitleStyle = CSSProperties & {
  "--focus-live-title-overflow"?: string;
};

const SCROLL_THRESHOLD_PX = 1;

export function FocusLiveTitle({ title, scrollingEnabled }: FocusLiveTitleProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useLayoutEffect(() => {
    if (!scrollingEnabled) {
      setOverflowPx(0);
      return;
    }

    const measure = () => {
      const container = containerRef.current;
      const text = textRef.current;
      if (!container || !text) return;
      const nextOverflow = Math.max(0, Math.ceil(text.scrollWidth - container.clientWidth));
      setOverflowPx((current) => (current === nextOverflow ? current : nextOverflow));
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    if (textRef.current) observer.observe(textRef.current);
    return () => observer.disconnect();
  }, [scrollingEnabled, title]);

  const scrolling = scrollingEnabled && overflowPx > SCROLL_THRESHOLD_PX;
  const scrollState = scrolling ? "active" : scrollingEnabled ? "idle" : "off";
  const style: LiveTitleStyle | undefined = scrolling
    ? { "--focus-live-title-overflow": `${overflowPx}px` }
    : undefined;

  return (
    <span
      ref={containerRef}
      className="focus-panel__live-title"
      title={title}
      data-focus-live-title-scroll={scrollState}
      style={style}
    >
      <span ref={textRef} className="focus-panel__live-title-text">
        {title}
      </span>
    </span>
  );
}
