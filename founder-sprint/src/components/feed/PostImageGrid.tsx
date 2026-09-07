"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type PostImageDisplaySize = "small" | "medium" | "large";

interface PostImageGridProps {
  images: Array<{ id?: string; imageUrl: string }>;
  displaySize?: string | null;
}

const IMAGE_DISPLAY_SIZE_STYLES: Record<
  PostImageDisplaySize,
  {
    singleMaxWidth: string;
    singleMaxHeight: string;
    pairHeight: string;
    railWidth: string;
  }
> = {
  small: {
    singleMaxWidth: "min(100%, 340px)",
    singleMaxHeight: "240px",
    pairHeight: "clamp(110px, 18vw, 170px)",
    railWidth: "clamp(130px, 22vw, 180px)",
  },
  medium: {
    singleMaxWidth: "min(100%, 520px)",
    singleMaxHeight: "320px",
    pairHeight: "clamp(140px, 24vw, 220px)",
    railWidth: "clamp(160px, 28vw, 220px)",
  },
  large: {
    singleMaxWidth: "100%",
    singleMaxHeight: "520px",
    pairHeight: "clamp(180px, 32vw, 300px)",
    railWidth: "clamp(220px, 34vw, 280px)",
  },
};

export function PostImageGrid({
  images,
  displaySize = "medium",
}: PostImageGridProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const hasMultipleImages = images.length > 1;
  const activeImage = activeImageIndex === null ? null : images[activeImageIndex];

  useEffect(() => {
    if (activeImageIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setActiveImageIndex(null); return; }
      if (!hasMultipleImages) return;
      if (event.key === "ArrowLeft") {
        setActiveImageIndex((c) => c === null ? c : c === 0 ? images.length - 1 : c - 1);
      }
      if (event.key === "ArrowRight") {
        setActiveImageIndex((c) => c === null ? c : c === images.length - 1 ? 0 : c + 1);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
  }, [activeImageIndex, hasMultipleImages, images.length]);

  if (images.length === 0) return null;

  const isSingle = images.length === 1;
  const isPair = images.length === 2;
  const isRail = images.length >= 3;
  const normalizedDisplaySize: PostImageDisplaySize =
    displaySize === "small" || displaySize === "medium" || displaySize === "large"
      ? displaySize : "medium";
  const sizeStyles = IMAGE_DISPLAY_SIZE_STYLES[normalizedDisplaySize];

  return (
    <div
      aria-label={"Post images (" + images.length + ")"}
      style={{
        display: isRail ? "flex" : "grid",
        gridTemplateColumns: isPair ? "repeat(2, minmax(0, 1fr))" : "1fr",
        gap: "10px",
        marginTop: "12px",
        justifyItems: isSingle ? "start" : undefined,
        overflowX: isRail ? "auto" : undefined,
        overflowY: isRail ? "hidden" : undefined,
        paddingBottom: isRail ? "2px" : undefined,
        scrollSnapType: isRail ? "x proximity" : undefined,
        scrollbarWidth: isRail ? "thin" : undefined,
      }}
    >
      {images.map((image, index) => (
        <div
          key={image.id || image.imageUrl}
          role="button"
          tabIndex={0}
          onClick={(event) => { event.stopPropagation(); setActiveImageIndex(index); }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault(); event.stopPropagation(); setActiveImageIndex(index);
            }
          }}
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #E8E1D4",
            backgroundColor: isSingle ? "transparent" : "#F6F2EA",
            cursor: "zoom-in",
            aspectRatio: isSingle ? undefined : isRail ? "16 / 10" : undefined,
            height: isPair ? sizeStyles.pairHeight : undefined,
            maxWidth: isSingle ? "100%" : undefined,
            width: isSingle ? "fit-content" : isRail ? sizeStyles.railWidth : undefined,
            flex: isRail ? "0 0 auto" : undefined,
            scrollSnapAlign: isRail ? "start" : undefined,
            position: "relative",
          }}
        >
          {isSingle ? (
            <img
              src={image.imageUrl}
              alt={"Post image " + (index + 1)}
              loading="lazy"
              decoding="async"
              style={{
                display: "block", width: "auto", height: "auto",
                maxWidth: sizeStyles.singleMaxWidth,
                maxHeight: sizeStyles.singleMaxHeight,
                objectFit: "contain", objectPosition: "center",
              }}
            />
          ) : (
            <Image
              src={image.imageUrl}
              alt={"Post image " + (index + 1)}
              fill
              sizes={isRail ? "220px" : isPair ? "50vw" : "100vw"}
              loading="lazy"
              quality={75}
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          )}
        </div>
      ))}

      {activeImage && activeImageIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={"Image " + (activeImageIndex + 1) + " of " + images.length}
          onClick={(e) => { e.stopPropagation(); setActiveImageIndex(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            backgroundColor: "rgba(18, 17, 15, 0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px", cursor: "zoom-out",
          }}
        >
          <button type="button" aria-label="Close" onClick={(e) => { e.stopPropagation(); setActiveImageIndex(null); }}
            style={{ position: "absolute", top: "18px", right: "18px", width: "38px", height: "38px",
              borderRadius: "50%", border: "1px solid rgba(255,255,255,0.22)",
              backgroundColor: "rgba(255,255,255,0.12)", color: "white", fontSize: "24px", lineHeight: 1, cursor: "pointer" }}>
            &#215;
          </button>
          {hasMultipleImages && (
            <button type="button" aria-label="Previous" onClick={(e) => {
              e.stopPropagation(); setActiveImageIndex((c) => c === null ? c : c === 0 ? images.length - 1 : c - 1);
            }} style={{ position: "absolute", left: "18px", width: "42px", height: "42px",
              borderRadius: "50%", border: "1px solid rgba(255,255,255,0.22)",
              backgroundColor: "rgba(255,255,255,0.12)", color: "white", fontSize: "28px", lineHeight: 1, cursor: "pointer" }}>
              &#8249;
            </button>
          )}
          <img src={activeImage.imageUrl} alt={"Expanded image " + (activeImageIndex + 1)}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "min(100%, 1120px)", maxHeight: "90vh", width: "auto", height: "auto",
              objectFit: "contain", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.35)", cursor: "default" }}
          />
          {hasMultipleImages && (
            <button type="button" aria-label="Next" onClick={(e) => {
              e.stopPropagation(); setActiveImageIndex((c) => c === null ? c : c === images.length - 1 ? 0 : c + 1);
            }} style={{ position: "absolute", right: "18px", width: "42px", height: "42px",
              borderRadius: "50%", border: "1px solid rgba(255,255,255,0.22)",
              backgroundColor: "rgba(255,255,255,0.12)", color: "white", fontSize: "28px", lineHeight: 1, cursor: "pointer" }}>
              &#8250;
            </button>
          )}
          {hasMultipleImages && (
            <div style={{ position: "absolute", bottom: "18px", left: "50%", transform: "translateX(-50%)",
              padding: "5px 10px", borderRadius: "999px", backgroundColor: "rgba(255,255,255,0.14)",
              color: "white", fontSize: "12px", fontWeight: 600 }}>
              {activeImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
