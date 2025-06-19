"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";

export default function SwapPage() {
  const router = useRouter();
  const [point, setPoint] = useState(0);
  const conversionRate = 0.01; // 수정된 환율: 1 POINT = 0.01 USDT
  const maxPoint = 100; // 예시 최대 포인트
  const maxRwd = 50; // 하루 최대 교환 수량
  const todayExchanged = 0.01;

  const rwd = (point * conversionRate).toFixed(3);

  return (
    <div className="min-h-screen bg-white pb-24">
      <TopBar title="포인트 교환" showBack />

      <div className="px-4 pt-4">
        <div className="text-xs text-gray-500 mb-2">
        </div>

        {/* 교환 카드 */}
        <div className="bg-white rounded-2xl p-4 shadow border">
          <h2 className="text-lg font-bold mb-4">POINT/USDT</h2>

          {/* 입력 영역 */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src="/icons/coin.png" alt="point" className="w-6 h-6" />
                <span className="font-semibold text-lg">POINT</span>
              </div>
              <button
                onClick={() => setPoint(maxPoint)}
                className="bg-blue-100 text-blue-600 px-3 py-1 text-sm rounded-full font-semibold"
              >
                MAX
              </button>
            </div>
            <input
              type="number"
              value={point}
              onChange={(e) => setPoint(Number(e.target.value))}
              className="w-full mt-2 text-right text-2xl font-bold border-b border-gray-200 py-2"
              placeholder="0"
            />
          </div>

          {/* 변환 아이콘 */}
          <div className="flex justify-center my-2">
            <img src="/icons/swap.png" alt="swap" className="w-5 h-5" />
          </div>

          {/* 출력 영역 */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <img src="/icons/usdt.png" alt="rwd" className="w-6 h-6" />
              <span className="font-semibold text-lg">USDT</span>
            </div>
            <p className="text-right text-2xl font-bold mt-2">{rwd}</p>
          </div>

          <p className="text-center text-sm text-blue-500 font-semibold">
            100 POINT = 1 USDT
          </p>

          <button
            onClick={() => router.push("/wallet/swap/complete")}
            disabled={point === 0}
            className="w-full mt-4 bg-gradient-to-r from-cyan-200 to-blue-400 text-white py-3 rounded-full font-bold disabled:opacity-40"
          >
            교환
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}