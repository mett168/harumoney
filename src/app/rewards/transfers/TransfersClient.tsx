"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";
import { getKSTISOString } from "@/lib/dateUtil";

// 상태 → 한글표기
const statusText: Record<string, string> = {
  pending: "대기",
  failed: "실패",
  sent: "송금완료",
  success: "송금완료",
};

type Row = {
  id: string;
  ref_code: string;
  total_amount: number | null;
  status: "pending" | "sent" | "failed" | "success";
  memo?: string | null;
  created_at?: string | null; // ISO
};

export default function TransfersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const range = searchParams.get("range") ?? "30d";
  const ref = searchParams.get("ref") ?? "";

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // 날짜 범위 (created_at 기준)
  const { gteISO, ltISO, label } = useMemo(() => {
    const todayKst = getKSTISOString().slice(0, 10); // YYYY-MM-DD
    const base = new Date(`${todayKst}T00:00:00+09:00`);

    const clone = (d: Date) => new Date(d.getTime());
    let gte = "";
    let lt = "";

    if (range === "today") {
      const start = clone(base);
      const end = clone(base);
      end.setDate(end.getDate() + 1);
      gte = start.toISOString();
      lt = end.toISOString();
    } else if (range === "7d") {
      const start = clone(base);
      start.setDate(start.getDate() - 6);
      const end = clone(base);
      end.setDate(end.getDate() + 1);
      gte = start.toISOString();
      lt = end.toISOString();
    } else if (range === "all") {
      gte = "";
      lt = "";
    } else {
      // 기본 30일
      const start = clone(base);
      start.setDate(start.getDate() - 29);
      const end = clone(base);
      end.setDate(end.getDate() + 1);
      gte = start.toISOString();
      lt = end.toISOString();
    }

    const label =
      range === "today" ? "오늘" :
      range === "7d" ? "최근 7일" :
      range === "all" ? "전체" :
      "최근 30일";

    return { gteISO: gte, ltISO: lt, label };
  }, [range]);

  // 데이터 로드
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrMsg(null);
      try {
        if (!ref) {
          setRows([]);
          setLoading(false);
          return;
        }

        let q = supabase
          .from("reward_transfers")
          .select("*")
          .eq("ref_code", ref)
          .order("created_at", { ascending: false });

        if (gteISO && ltISO) {
          q = q.gte("created_at", gteISO).lt("created_at", ltISO);
        }

        const { data, error } = await q;
        if (error) throw error;
        setRows((data ?? []) as Row[]);
      } catch (e: any) {
        setErrMsg(e?.message ?? "데이터 불러오기 실패");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ref, gteISO, ltISO]);

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-28">
      <TopBar />

      <div className="px-4 pt-3 space-y-3">
        {/* 돌아가기 + 라벨 */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-medium bg-white shadow-sm hover:bg-gray-50 active:scale-[0.99]"
          >
            <span className="inline-block rotate-180">➜</span>
            돌아가기
          </button>
          <div className="text-sm text-gray-500">{label} 송금 이력</div>
        </div>

        {/* 대상 ref */}
        <div className="text-[13px] text-gray-600">
          대상: <span className="font-semibold">{ref || "—"}</span>
        </div>

        {/* 본문 */}
        <section className="bg-white rounded-xl shadow">
          {loading ? (
            <div className="p-6 text-center text-gray-500">불러오는 중…</div>
          ) : errMsg ? (
            <div className="p-6 text-center text-red-600">{errMsg}</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-gray-500">표시할 내역이 없습니다.</div>
          ) : (
<ul className="divide-y">
  {rows.map((r) => {
    const dateText = r.created_at?.slice(0, 10) ?? "--";
    const amount = typeof r.total_amount === "number" ? r.total_amount : 0;
    const statusKo = statusText[r.status] ?? r.status;

    return (
      <li key={r.id} className="p-4 relative">
        <div className="flex items-center justify-between text-[14px] font-medium">
          {/* 왼쪽: 날짜 */}
          <span className="text-gray-700">{dateText}</span>

          {/* 가운데: 수량 (absolute center) */}
          <span className="absolute left-1/2 -translate-x-1/2 font-bold">
            {amount} USDT
          </span>

          {/* 오른쪽: 상태 */}
          <span className="text-gray-600">{statusKo}</span>
        </div>
      </li>
    );
  })}
</ul>


          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
