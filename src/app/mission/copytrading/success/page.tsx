'use client';

import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { supabase } from "@/lib/supabaseClient";
import { getKSTDateString } from "@/lib/dateUtil";

export default function CopySuccessPage() {
  const router = useRouter();
  const account = useActiveAccount();

  const handleComplete = async () => {
    if (!account?.address) return;

    const { data: user } = await supabase
      .from("users")
      .select("ref_code")
      .eq("wallet_address", account.address.toLowerCase())
      .maybeSingle();

    if (!user?.ref_code) return;

    const today = getKSTDateString();

    await supabase.from("daily_quests").upsert(
      {
        ref_code: user.ref_code,
        date: today,
        type: "copytrading",
        status: "completed",
      },
      {
        onConflict: ["ref_code", "date", "type"],
      }
    );

    // ✅ 미션 페이지로 이동
    router.push("/mission");
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

      <button
        onClick={handleComplete}
        className="bg-white text-[#00c4c4] font-bold px-6 py-3 rounded-xl"
      >
        완료
      </button>
    </div>
  );
}
