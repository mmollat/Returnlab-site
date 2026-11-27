"use client";

import type { ComponentPropsWithoutRef } from "react";

type DateInputProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "onClick">;

export default function IntakeDateInput({ className, ...props }: DateInputProps) {
  return (
    <input
      {...props}
      type="date"
      className={`${className ?? ""} cursor-pointer [color-scheme:dark]`}
      onClick={(event) => {
        const field = event.currentTarget;
        if (field.disabled || field.readOnly || typeof field.showPicker !== "function") return;
        try {
          field.showPicker();
          // The native calendar icon may also handle the click. Open it only once.
          event.preventDefault();
        } catch {
          // Preserve the browser's native date control when showPicker is unavailable here.
        }
      }}
    />
  );
}
