"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { switchBatch } from "@/actions/batch-switcher";
import { getEffectiveBatchStatus } from "@/lib/batch-utils";
import { useToast } from "@/hooks/useToast";

interface BatchSwitcherProps {
  batches: Array<{ batchId: string; batchName: string; batchStatus?: string; endDate?: Date }>;
  currentBatchId: string;
}

export default function BatchSwitcher({ batches, currentBatchId }: BatchSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const ref = useRef<HTMLDivElement>(null);

  const currentBatch = batches.find((b) => b.batchId === currentBatchId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (batches.length <= 1) return null;

  const handleSwitch = async (batchId: string) => {
    if (batchId === currentBatchId) {
      setIsOpen(false);
      return;
    }
    setSwitching(true);
    setIsOpen(false);
    const result = await switchBatch(batchId);
    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setSwitching(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0",
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(232,228,220,0.8)",
          borderRadius: "999px",
          padding: "5px 16px 5px 14px",
          color: "#2F2C26",
          fontSize: "12px",
          fontWeight: 500,
          cursor: switching ? "wait" : "pointer",
          opacity: switching ? 0.6 : 1,
          whiteSpace: "nowrap" as const,
          transition: "all 0.2s ease",
          boxShadow: "0 1px 3px rgba(47,44,38,0.04)",
        }}
      >
        {switching ? (
          <span>Switching...</span>
        ) : (
          <>
            <span style={{ color: "#2F2C26", fontSize: "12px", fontWeight: 500 }}>
              {(currentBatch?.batchName || "Select Batch").replace(/Batch \d+/, "").trim()}
            </span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              marginLeft: "8px",
              backgroundColor: "#FB651E",
              color: "#FFFFFF",
              fontSize: "10.5px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "999px",
              letterSpacing: "0.03em",
              position: "relative" as const,
              overflow: "hidden" as const,
            }}>
              <span style={{
                position: "absolute" as const,
                top: 0,
                left: "-100%",
                width: "200%",
                height: "100%",
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 65%, transparent 100%)",
                animation: "shimmer 3s ease-in-out infinite",
              }} />
              {(currentBatch?.batchName || "").match(/Batch \d+/)?.[0] || "Batch"}
            </span>
          </>
        )}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          style={{
            marginLeft: "10px",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <path d="M1 1L5 5L9 1" stroke="#8A8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              backgroundColor: "var(--color-card-bg, #ffffff)",
              border: "1px solid #E8E4DC",
              borderRadius: "8px",
              padding: "4px 0",
              minWidth: "200px",
              zIndex: 200,
              boxShadow: "var(--shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.15))",
              transformOrigin: "top left",
            }}
          >
            {batches.map((batch) => {
              const isCurrent = batch.batchId === currentBatchId;
              const effectiveStatus = batch.batchStatus && batch.endDate
                ? getEffectiveBatchStatus({ status: batch.batchStatus as "active" | "archived", endDate: new Date(batch.endDate) })
                : "active";
              const isEnded = effectiveStatus !== "active";
              return (
                <button
                  key={batch.batchId}
                  onClick={() => handleSwitch(batch.batchId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "10px 14px",
                    border: "none",
                    background: "none",
                    color: isCurrent ? "var(--color-accent, #1A1A1A)" : "var(--color-foreground, #2F2C26)",
                    fontSize: "14px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: isCurrent ? 500 : 400,
                    opacity: isEnded ? 0.6 : 1,
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span style={{ width: "16px", flexShrink: 0, color: "var(--color-accent, #1A1A1A)" }}>{isCurrent ? "✓" : ""}</span>
                  <span>{batch.batchName}{isEnded ? ` (${effectiveStatus === "expired" ? "Ended" : "Archived"})` : ""}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
