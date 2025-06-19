'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { useActiveAccount } from "thirdweb/react";
import { supabase } from "@/lib/supabaseClient";

export default function CopyTradingPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const [selected, setSelected] = useState<number | null>(0);

  const passList = [
    {
      name: "Copy Pass 1000",
      reward: "150 Point",
    },
    {
      name: "Copy Pass 3000",
      reward: "450 Point",
    },
    {
      name: "Copy Pass 10000",
      reward: "1500 Point",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-24">
      <TopBar title="미션 상세" showBack />

      <div className="text-center mt-6 px-4">
        <p className="inline-block bg-white px-4 py-1 rounded-full text-xs text-gray-500 shadow-md">
          <span className="text-[10px]">카피 트레이딩 미션</span>
        </p>
        <h1 className="text-[20px] font-bold text-gray-900 mt-2">숙련된 트레이더와 함께하는<br />카피트레이딩 패스</h1>
        <p className="text-sm text-gray-500 mt-2">카피 트레이딩 시작하고<br />보상받자!</p>
      </div>

      <div className="mt-6 px-4 space-y-4">
        {passList.map((pass, idx) => {
          const isSelected = selected === idx;
          return (
            <div
              key={idx}
              onClick={() => setSelected(idx)}
              className={`rounded-2xl border p-4 shadow cursor-pointer transition-all ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-bold ${
                  isSelected ? "text-blue-600" : "text-gray-600"
                }`}>
                  {pass.name}
                </span>
                <span className="text-[16px] font-bold text-gray-800">{pass.price}</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                <li>✔ 모든 콘텐츠 열람 가능</li>
                <li>✔ 퀘스트 보상 하루 최대 {pass.reward}</li>
                <li>✔ 친구초대 시 친구가 받는 리워드의 20%</li>
              </ul>
            </div>
          );
        })}
      </div>

      <div className="px-4 mt-8">
        <button
          onClick={() => {
            if (selected !== null) {
              const selectedPass = passList[selected];
              router.push(`/mission/copytrading/confirm?pass=${encodeURIComponent(selectedPass.name)}`);
            }
          }}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
