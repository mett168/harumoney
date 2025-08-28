// src/app/admin/page.tsx
"use client";

import { useState } from "react";
import AdminAuth from "@/components/AdminAuth";
import ManualRewardPanel from "@/components/admin/ManualRewardPanel"; // 기존

export default function AdminDashboard() {
  const [loading, setLoading] = useState<"none" | "calc" | "send">("none");
  const [log, setLog] = useState("");

  async function call(endpoint: string, kind: "calc" | "send") {
    try {
      setLoading(kind);
      setLog((p) => p + `\n▶ ${endpoint} 호출...`);
      const res = await fetch(endpoint, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "API 실패");
      setLog((p) => p + `\n✅ ${json?.message || "성공"}`);
    } catch (e: any) {
      setLog((p) => p + `\n❌ 오류: ${e?.message || e}`);
    } finally {
      setLoading("none");
    }
  }

  return (
    <AdminAuth>
      <div className="space-y-8">
        {/* 상단 관리자 요약 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">📊 관리자 대시보드</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>총 유저 수</li>
          </ul>
        </div>

        {/* ✅ 리워드 자동 처리 섹션 */}
        <section className="bg-white rounded-xl shadow p-5 space-y-4">
          <h3 className="text-lg font-semibold">리워드 자동 처리</h3>
          <p className="text-sm text-gray-600">
            오늘자(KST) 기준으로 계산 후, 미지급 대상에게 USDT 송금합니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              disabled={loading !== "none"}
              onClick={() => call("/api/rewards/calc-today", "calc")}
              className="h-12 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60"
            >
              {loading === "calc" ? "계산 중..." : "1) 리워드 계산"}
            </button>
            <button
              disabled={loading !== "none"}
              onClick={() => call("/api/rewards/send-today", "send")}
              className="h-12 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
            >
              {loading === "send" ? "송금 중..." : "2) 리워드 송금"}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-semibold mb-1">로그</div>
            <pre className="text-xs whitespace-pre-wrap text-gray-700 min-h-[80px]">
              {log || "– 아직 로그가 없습니다."}
            </pre>
          </div>
        </section>

        {/* ✅ 수동 송금 패널 (기존) */}
        <ManualRewardPanel />
      </div>
    </AdminAuth>
  );
}
