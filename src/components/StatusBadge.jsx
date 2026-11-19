import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, X } from "lucide-react";

const config = {
  approved: { label: "Aprovado", className: "bg-primary/10 text-primary", Icon: Check },
  pending: { label: "Pendente", className: "bg-accent/25 text-foreground", Icon: Clock },
  rejected: { label: "Rejeitado", className: "bg-destructive/15 text-destructive", Icon: X },
};

export default function StatusBadge({ status, className }) {
  const c = config[status] || config.pending;
  const Icon = c.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-600",
        c.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}