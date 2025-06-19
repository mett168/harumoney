"use client";

import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { supabase } from "@/lib/supabaseClient";
import { getKSTDateString } from "@/lib/dateUtil";
import { useState } from "react";

// ✅ 타입 정의는 컴포넌트 바깥에
type DailyQuest = {
  ref_code: string;
  date: string;
  type: string;
  status: string;
};

export default function CopySuccessPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    if (!account?.address) return;

    setLoading(true);
    setError("");

    try {
      // ✅ 유저 정보 조회
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("ref_code")
        .eq("wallet_address", account.address.toLowerCase())
        .maybeSingle();

      if (userError) throw new Error("유저 조회 실패");
      if (!user?.ref_code) throw new Error("추천 코드 없음");

      const today = getKSTDateString();

// ✅ 퀘스트 저장 - 중복 검사 후 처리
const { data: existing, error: selectError } = await supabase
  .from("daily_quests")
  .select("id")
  .eq("ref_code", user.ref_code)
  .eq("date", today)
  .eq("type", "copytrading")
  .maybeSingle();

if (selectError) throw new Error("퀘스트 조회 실패");

let saveError = null;

if (existing) {
  const { error: updateError } = await supabase
    .from("daily_quests")
    .update({
      status: "completed",
    })
    .eq("id", existing.id);

  saveError = updateError;
} else {
  const { error: insertError } = await supabase
    .from("daily_quests")
    .insert({
      ref_code: user.ref_code,
      date: today,
      type: "copytrading",
      status: "completed",
    });

  saveError = insertError;
}

if (saveError) throw new Error("퀘스트 저장 실패");



      // ✅ 완료 후 이동
      router.push("/mission");
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00c4c4] flex flex-col items-center justify-center text-white text-center px-6">
      <h1 className="text-3xl font-bold mb-4">미션 완료!</h1>
      <p className="text-sm mb-6">
        검수가 필요한 미션의 경우,<br />
        검수 후 몬포인트가 지급됩니다.
      </p>

      <div className="bg-white text-[#00c4c4] rounded-2xl px-4 py-3 w-full max-w-xs mb-6">
        <div className="text-sm mb-2">오늘의 리워드</div>
        <div className="text-right font-bold text-lg">10P</div>
      </div>

      <div className="text-white text-sm mb-1">총 적립 예정 포인트</div>
      <div className="text-3xl font-bold mb-8">10P</div>

      {error && <p className="text-red-200 text-sm mb-4">{error}</p>}

      <button
        onClick={handleComplete}
        className={`bg-white text-[#00c4c4] font-bold px-6 py-3 rounded-xl ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "처리 중..." : "완료"}
      </button>
    </div>
  );
}
