"use client";

import TreemapChart from "@/components/TreemapChart";

export default function Overview() {
  const mealData = [
    { name: "Salmon en Papillote", count: 16, color: "#bac94a" },
    { name: "Duck Confit", count: 13, color: "#e0b0b0" },
    { name: "Boeuf Bourguignon", count: 20, color: "#85b1bd" },
    { name: "Rabbit Roulade", count: 10, color: "#ce92ce" },
    { name: "Coq au Vin", count: 5, color: "#cbba89" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-8">Meal Orders Overview</h1>
      <div className="w-full max-w-5xl">
        <TreemapChart data={mealData} />
      </div>
    </div>
  );
}
