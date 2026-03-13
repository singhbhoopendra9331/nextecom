"use client";

import { ReactNode, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Props = {
  title?: string;
  children: ReactNode;

  side?: "left" | "right" | "top" | "bottom";
  width?: string;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AppSheet({
  title,
  children,
  side = "right",
  width = "w-[480px]",
  open,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);

  // decide which state to use
  const isControlled = open !== undefined;
  const sheetOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      <SheetContent side={side} className={`${width} p-0`}>
        {title && (
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}

        <div className="py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}