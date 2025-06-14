"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface TopBarProps {
  icon?: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotification?: boolean;
  point?: number;
}

export default function TopBar({
  icon,
  title = "HARU REWARD",
  showBack = false,
  onBack,
  showNotification = true,
  point = 0,
}: TopBarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 w-full bg-blue-500 text-white shadow-md">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[500px] px-4 py-3 flex justify-between items-center">
          
          {/* 왼쪽: 뒤로가기 or 로고 */}
          <div className="flex items-center space-x-2">
            {showBack ? (
              <img
                src="/icons/icon-back.png"
                alt="뒤로가기"
                className="w-5 h-5 cursor-pointer"
                onClick={onBack || (() => router.back())}
              />
            ) : (
              <span className="text-lg font-bold">HARU REWARD</span>
            )}
          </div>

          {/* 오른쪽: 포인트 + 알림 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <img src="/icons/coin.png" alt="Point" className="w-4 h-4" />
              <span className="text-sm font-semibold">{point} Point</span>
            </div>

            {showNotification && (
              <div className="relative">
                <img src="/icons/bell.png" alt="알림" className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
