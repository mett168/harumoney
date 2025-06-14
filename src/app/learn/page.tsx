'use client';

import { Bell } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import AdBanner from "@/components/AdBanner";

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-24">
      {/* ✅ 상단바 */}
      <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-lg">HARU REWARD</div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-yellow-300">0 Point</span>
          <Bell className="w-5 h-5" />
        </div>
      </div>

      {/* ✅ 광고 배너 (간격 줄임) */}
      <div className="mt-2">
        <AdBanner />
      </div>

      {/* ✅ 학습 콘텐츠 */}
      <div className="px-4 mt-6 space-y-6">
        <div>
          <h2 className="font-semibold mb-2">크립토 기초</h2>
          <div className="space-y-2">
            <div className="bg-white rounded-xl p-4 flex justify-between items-center shadow">
              <span>Step1 크립토의 기본 개념</span>
              <span>{'>'}</span>
            </div>
            <div className="bg-white rounded-xl p-4 flex justify-between items-center shadow">
              <span>Step2 블록체인이란?</span>
              <span>{'>'}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">선물거래</h2>
          <div className="space-y-2">
            <div className="bg-white rounded-xl p-4 flex justify-between items-center shadow">
              <span>Step1 선물거래 기본개념</span>
              <span>{'>'}</span>
            </div>
            <div className="bg-white rounded-xl p-4 flex justify-between items-center shadow">
              <span>Step2 기술적분석 기초</span>
              <span>{'>'}</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
