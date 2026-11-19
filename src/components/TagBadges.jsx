import React from "react";

export default function TagBadges({ tags = [], limit = 0, className = "" }) {
  let list = Array.isArray(tags) ? tags.filter(Boolean) : [];
  if (limit) list = list.slice(0, limit);
  if (!list.length) return null;
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {list.map((t) => (
        <span
          key={t}
          className="max-w-full truncate rounded-full bg-primary/10 text-primary text-xs font-600 px-2 py-0.5"
        >
          {t}
        </span>
      ))}
    </div>
  );
}