'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ListChecks,
  BookOpenCheck,
  Menu,
  Wallet, // ✅ 지갑 아이콘 추가
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="relative">
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-14 text-xs text-gray-500">
          
          <Link href="/home" className="flex flex-col items-center">
            <Home size={20} className={isActive("/home") ? "text-blue-600" : "text-gray-400"} />
            <span className={isActive("/home") ? "text-blue-600" : "text-gray-400"}>홈</span>
          </Link>

          <Link href="/mission" className="flex flex-col items-center">
            <ListChecks size={20} className={isActive("/mission") ? "text-blue-600" : "text-gray-400"} />
            <span className={isActive("/mission") ? "text-blue-600" : "text-gray-400"}>미션</span>
          </Link>

          <Link href="/learn" className="flex flex-col items-center">
            <BookOpenCheck size={20} className={isActive("/learn") ? "text-blue-600" : "text-gray-400"} />
            <span className={isActive("/learn") ? "text-blue-600" : "text-gray-400"}>학습</span>
          </Link>

                    {/* ✅ 지갑 추가 */}
          <Link href="/wallet" className="flex flex-col items-center">
            <Wallet size={20} className={isActive("/wallet") ? "text-blue-600" : "text-gray-400"} />
            <span className={isActive("/wallet") ? "text-blue-600" : "text-gray-400"}>교환</span>
          </Link>

          <Link href="/menu" className="flex flex-col items-center">
            <Menu size={20} className={isActive("/menu") ? "text-blue-600" : "text-gray-400"} />
            <span className={isActive("/menu") ? "text-blue-600" : "text-gray-400"}>메뉴</span>
          </Link>

        </div>
      </div>
    </div>
  );
}
