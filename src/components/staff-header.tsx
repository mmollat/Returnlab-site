import Image from "next/image";
import type { ReactNode } from "react";

export default function StaffHeader({ title, subtitle, children }: {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <Image src="/returnlab-staff-logo.png" alt="ReturnLab Logistics" width={640} height={210} className="-ml-4 mb-1 h-auto w-60 max-w-full" unoptimized />
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <div className="mt-2 text-sm text-zinc-400">{subtitle}</div>}
      </div>
      {children}
    </header>
  );
}
