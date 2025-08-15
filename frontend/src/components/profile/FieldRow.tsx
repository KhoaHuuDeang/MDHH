"use client";

import React from "react";
import { getIcon } from "@/utils/getIcon";

interface FieldRowProps {
  label: string;
  value: React.ReactNode;
  icon?: string;
  readOnly?: boolean;
  action?: React.ReactNode;
}

function FieldRow({ label, value, icon, readOnly, action }: FieldRowProps) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-3 rounded-xl border p-4",
        "bg-white/90 border-gray-200 hover:bg-zinc-50 hover:border-zinc-300",
        "transition-colors duration-200",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            {getIcon(icon, 16)}
          </span>
        )}
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
          <div className="mt-1 text-sm text-gray-900">{value}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {readOnly ? (
          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">Read-only</span>
        ) : (
          action
        )}
      </div>
    </div>
  );
}

FieldRow.displayName = "FieldRow";
export default FieldRow;