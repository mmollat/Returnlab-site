import type { ReactNode } from "react";

export default function ClientPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 [color-scheme:dark]">
      {children}
    </div>
  );
}
