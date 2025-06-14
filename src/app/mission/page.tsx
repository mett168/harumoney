'use client';

import { useState } from "react";
import { Bell } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";

type Mission = {
  emoji: string;
  title: string;
  subtitle?: string;
  rewardText?: string;
  status: "available" | "completed";
};

const missions: Mission[] = [
  { emoji: "🎓", title: "데일리 퀴즈", subtitle: "10 포인트 받기", status: "completed" },
  { emoji: "🧪", title: "PropW 테스트", subtitle: "포인트 받기", status: "available" },
  { emoji: "📈", title: "CoinW 카피 트레이딩", subtitle: "포인트 받기", status: "available" },
  { emoji: "🤝", title: "친구 초대", subtitle: "25 포인트 받기", status: "available" },
];

export default function MissionPage() {
  const [myPoint, setMyPoint] = useState(0);

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-24">
      {/* ✅ 상단 바 */}
      <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-lg">HARU REWARD</div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-yellow-300">{myPoint} Point</span>
          <Bell className="w-5 h-5" />
        </div>
      </div>

      {/* ✅ 광고 배너 (간격 줄임) */}
      <div className="mt-2">
        <AdBanner />
      </div>

      {/* ✅ 미션 카드 박스 */}
      <div className="px-4 mt-4 space-y-4">
        {missions.map((m, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow flex justify-between items-start">
            {/* 좌측 텍스트 */}
            <div className="flex items-start gap-3">
              <div className="text-2xl">{m.emoji}</div>
              <div>
                <div className="font-semibold text-lg">{m.title}</div>
                {m.subtitle && <div className="text-sm text-gray-500">{m.subtitle}</div>}
              </div>
            </div>
            {/* 우측 버튼 */}
            <button
              disabled={m.status === "completed"}
              className={`px-4 py-1 text-sm font-semibold rounded-full h-fit ${
                m.status === "completed"
                  ? "bg-gray-300 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {m.status === "completed" ? "완료" : "받기"}
            </button>
          </div>
        ))}
      </div>

      {/* ✅ 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}
