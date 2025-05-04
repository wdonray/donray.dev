import React from "react";

export function SectionSubHeader({
  children,
  className = "",
  ...props
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <h3
      className={`text-lg font-semibold tracking-tight text-primary mt-8 mb-4 flex items-center gap-2 ${className}`}
      {...props}
    >
      <span className="inline-block w-4 h-0.5 bg-primary rounded" />
      {children}
    </h3>
  );
} 