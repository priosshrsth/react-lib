"use client";

import clsx from "clsx";
import { type FC, type ReactEventHandler, type ReactNode, useEffect, useRef } from "react";

import "./dialog.css";

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  manual?: boolean;
  className?: string;
  closedBy?: "closerequest" | "any" | "none";
  resetOnClose?: boolean;
}

export const Dialog: FC<DialogProps> = ({ open, onClose, children, closedBy = "closerequest", className = "" }) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose: ReactEventHandler<HTMLDialogElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose?.();
  };

  return (
    <dialog
      className={clsx("m-auto transition-discrete backdrop:bg-black/80 backdrop:backdrop-blur-sm", className)}
      closedby={closedBy}
      onClose={handleClose}
      ref={ref}
    >
      {children}
    </dialog>
  );
};

export default Dialog;
