'use client';

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const steps = [
  { step: "1-1", title: "선물거래란?", href: "/learn/futures/step1/1-1" },
  { step: "1-2", title: "롱/숏이란?", href: "/learn/futures/step1/1-2" },
  { step: "1-3", title: "격리/교차 마진", href: "/learn/futures/step1/1-3" },
];

export default function FuturesStep1Page() {
  return (
    <div className="min-h-screen bg-[#e7eff5] px-4 py-6">
      <h1 className="text-xl font-bold mb-4">선물거래 기본개념</h1>

      <div className="space-y-4">
        {steps.map((item, idx) => (
          <Link href={item.href} key={idx}>
            <div className="flex justify-between items-center p-4 rounded-lg bg-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-white text-gray-500 text-xs px-2 py-1 rounded-md">
                  {item.step}
                </div>
                <span className="font-semibold">{item.title}</span>
              </div>
              <ChevronRight className="text-blue-500" size={18} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
