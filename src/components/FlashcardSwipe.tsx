"use client";

import { useCallback, useRef, useState } from "react";

const SWIPE_THRESHOLD = 72;
const TAP_THRESHOLD = 12;

interface FlashcardSwipeProps {
  topic: string;
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function FlashcardSwipe({
  topic,
  front,
  back,
  flipped,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
}: FlashcardSwipeProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const capturedPointerIdRef = useRef<number | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const releaseCapture = useCallback((pointerId: number) => {
    const element = cardRef.current;
    if (!element || capturedPointerIdRef.current !== pointerId) return;

    try {
      if (element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
    } catch {
      // Browser may already have released capture (common on iOS Safari).
    }

    capturedPointerIdRef.current = null;
  }, []);

  const resetDrag = useCallback(() => {
    draggingRef.current = false;
    setIsDragging(false);
    setOffset({ x: 0, y: 0 });
  }, []);

  const finishDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;

      releaseCapture(event.pointerId);

      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (flipped && absX > SWIPE_THRESHOLD && absX > absY) {
        if (dx < 0) onSwipeLeft();
        else onSwipeRight();
      } else if (
        !flipped &&
        absX < TAP_THRESHOLD &&
        absY < TAP_THRESHOLD
      ) {
        onFlip();
      } else if (
        !flipped &&
        dy < -SWIPE_THRESHOLD &&
        absY > absX
      ) {
        onFlip();
      }

      resetDrag();
    },
    [flipped, onFlip, onSwipeLeft, onSwipeRight, releaseCapture, resetDrag],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    draggingRef.current = true;
    setIsDragging(true);
    startRef.current = { x: event.clientX, y: event.clientY };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
      capturedPointerIdRef.current = event.pointerId;
    } catch {
      capturedPointerIdRef.current = null;
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;

    if (flipped) {
      setOffset({ x: dx, y: dy * 0.15 });
    } else {
      setOffset({ x: dx * 0.2, y: dy });
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(event);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    releaseCapture(event.pointerId);
    resetDrag();
  };

  const handleLostPointerCapture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (capturedPointerIdRef.current === event.pointerId) {
      capturedPointerIdRef.current = null;
      resetDrag();
    }
  };

  const swipeProgress =
    flipped && Math.abs(offset.x) > 0
      ? Math.min(Math.abs(offset.x) / SWIPE_THRESHOLD, 1)
      : 0;

  const leavingLeft = flipped && offset.x < -SWIPE_THRESHOLD * 0.6;
  const leavingRight = flipped && offset.x > SWIPE_THRESHOLD * 0.6;

  const rotation = offset.x * 0.04;
  const scale = isDragging ? 0.98 : 1;

  return (
    <div className="relative select-none touch-none">
      {flipped && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-4 left-0 flex w-14 items-center justify-center rounded-l-2xl text-amber-600 transition-opacity"
            style={{ opacity: offset.x < 0 ? swipeProgress : 0 }}
          >
            <span className="rounded-full bg-amber-100 p-2 text-lg font-bold">
              ✕
            </span>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-4 right-0 flex w-14 items-center justify-center rounded-r-2xl text-emerald-600 transition-opacity"
            style={{ opacity: offset.x > 0 ? swipeProgress : 0 }}
          >
            <span className="rounded-full bg-emerald-100 p-2 text-lg font-bold">
              ✓
            </span>
          </div>
        </>
      )}

      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            if (!flipped) onFlip();
          }
          if (flipped && event.key === "ArrowLeft") onSwipeLeft();
          if (flipped && event.key === "ArrowRight") onSwipeRight();
        }}
        className={`relative flex min-h-52 w-full cursor-grab flex-col justify-center rounded-2xl border bg-white p-6 text-left shadow-sm active:cursor-grabbing sm:min-h-64 sm:p-8 ${
          leavingLeft
            ? "border-amber-300 bg-amber-50"
            : leavingRight
              ? "border-emerald-300 bg-emerald-50"
              : "border-slate-200 hover:border-sky-300"
        } ${isDragging ? "" : "transition-[transform,box-shadow,border-color,background-color] duration-200"}`}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`,
        }}
      >
        <p className="line-clamp-2 text-xs font-medium uppercase tracking-wide text-sky-700">
          {topic}
        </p>
        <p className="mt-4 max-h-40 overflow-y-auto text-lg font-semibold leading-relaxed text-slate-900 sm:max-h-48 sm:text-2xl">
          {flipped ? back : front}
        </p>
        <p className="mt-6 text-sm text-slate-400">
          {flipped
            ? "Солға swipe — білмеймін · оңға — білемін"
            : "Жауапты көру — басу немесе жоғары swipe"}
        </p>
      </div>
    </div>
  );
}
