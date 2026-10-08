"use client";
import { cn } from "@/lib/utils/cn";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}
const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!isOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [isOpen]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "Dialog"}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
      className={cn(
        "w-[calc(100%-2rem)] rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        sizes[size],
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-100 p-5">
        <h2 id={titleId} className="text-lg font-bold">
          {title || "Details"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-[75dvh] overflow-y-auto p-5">{children}</div>
    </dialog>
  );
}
