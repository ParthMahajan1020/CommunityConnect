import { useCallback, useEffect, useRef, useState } from "react";

export default function Feedback() {
  const frameRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const [frameHeight, setFrameHeight] = useState("100dvh");

  const updateFrameHeight = useCallback(() => {
    const frameDocument = frameRef.current?.contentDocument;
    if (!frameDocument) return;

    const pageHeight = Math.max(
      frameDocument.documentElement.scrollHeight,
      frameDocument.body?.scrollHeight || 0
    );

    setFrameHeight(`${pageHeight}px`);
  }, []);

  const handleFrameLoad = useCallback(() => {
    updateFrameHeight();

    const frameDocument = frameRef.current?.contentDocument;
    if (!frameDocument || typeof ResizeObserver === "undefined") return;

    resizeObserverRef.current?.disconnect();

    resizeObserverRef.current = new ResizeObserver(updateFrameHeight);
    resizeObserverRef.current.observe(frameDocument.documentElement);
    if (frameDocument.body) {
      resizeObserverRef.current.observe(frameDocument.body);
    }
  }, [updateFrameHeight]);

  useEffect(
    () => () => resizeObserverRef.current?.disconnect(),
    []
  );

  return (
    <iframe
      ref={frameRef}
      title="CommunityConnect feedback form"
      src="/feedback/index.html"
      onLoad={handleFrameLoad}
      scrolling="no"
      className="block w-full border-0"
      style={{ height: frameHeight, minHeight: "100vh" }}
    />
  );
}
