"use client";

import { useSearchParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";

export default function SendConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const amount = searchParams.get("amount") || "0";
  const address = searchParams.get("to") || "";

  const shortAddress = address.slice(0, 8) + "..." + address.slice(-8);

  const handleSend = () => {
    // ✅ 송금 로직 처리 후 완료 페이지로 이동
    router.push("/wallet/recipient/confirm/complete");
  };

  return (
    <div className="min-h-screen bg-white px-5 pt-5 pb-24 flex flex-col">
      <TopBar title="보내기" showBack />

      <div className="mt-16 flex flex-col items-center">
        <img
          src="/icons/usdt-token.png"
          alt="usdt"
          className="w-16 h-16 mb-4"
        />
        <p className="text-4xl font-bold">{amount} USDT</p>
      </div>

      <div className="bg-gray-50 rounded-xl mt-10 px-4 py-3 text-sm text-gray-800 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">받는주소</span>
          <span className="font-mono">{shortAddress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">네트워크</span>
          <span className="font-semibold">Polygon</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">수수료</span>
          <span className="font-semibold">0 USDT</span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-full bg-gray-100 text-gray-700 font-semibold"
        >
          취소
        </button>
        <button
          onClick={handleSend}
          className="flex-1 py-3 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 text-white font-bold"
        >
          보내기
        </button>
      </div>
    </div>
  );
}
