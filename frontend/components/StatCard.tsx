import React from "react";
import { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  accent?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, accent = "", icon }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl px-8 py-10 shadow-xl font-semibold text-lg flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl ${accent}`}
      // Use accent as the background if provided, otherwise fallback to default
      style={accent ? undefined : { background: "linear-gradient(135deg, #f6e9c2 0%, #e6cfa3 100%)" }}
    >
      {icon && <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-green-100/60 text-3xl">{icon}</div>}
      <div className="mb-2 font-extrabold text-gray-700">{value}</div>
      <div className="text-base text-center font-medium text-gray-700 mt-1">{label}</div>
    </div>
  );
}
