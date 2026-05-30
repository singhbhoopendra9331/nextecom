"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: "text-sm",
        success: {
          className: "border border-border bg-background text-foreground",
        },
        error: {
          className: "border border-destructive/30 bg-background text-foreground",
        },
      }}
    />
  );
}
