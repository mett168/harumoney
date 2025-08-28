// src/app/api/rewards/calc-today/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getKSTISOString } from "@/lib/dateUtil";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PassRow = {
  id: string;
  ref_code: string;
  center_ref_code: string | null;
  price_usdt: number | null;
  reward_mode: "fixed" | "rate";
  daily_reward_usdt: number | null;
  self_reward_pct: number | null;
  center_reward_pct: number | null;
  is_active: boolean | null;
  expired_at: string | null;
};

// 👉 UNIQUE 제약 없이도 동작하도록 만든 수동 upsert 헬퍼
async function upsertRewardRow(payload: {
  ref_code: string;
  reward_amount: number;
  center_amount: number;
  total_amount: number;
  status: "pending";
  reward_date: string; // YYYY-MM-DD
  memo: "daily-self" | "daily-center";
  wallet_address: string | null; // ⭐ 추가 저장
  name: string | null;           // ⭐ 추가 저장
}) {
  const { data: existed, error: selErr } = await supabase
    .from("reward_transfers")
    .select("id")
    .eq("ref_code", payload.ref_code)
    .eq("reward_date", payload.reward_date)
    .eq("memo", payload.memo)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existed?.id) {
    const { error } = await supabase
      .from("reward_transfers")
      .update({
        reward_amount: payload.reward_amount,
        center_amount: payload.center_amount,
        total_amount: payload.total_amount,
        status: payload.status,
        wallet_address: payload.wallet_address, // ⭐
        name: payload.name,                     // ⭐
      })
      .eq("id", existed.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("reward_transfers").insert(payload);
    if (error) throw error;
  }
}

export async function POST(_req: NextRequest) {
  try {
    const today = getKSTISOString().slice(0, 10);

    // 0) daily_reward_usdt 재계산 저장 (rate 행만)
    {
      const { data: rateRows, error: selErr } = await supabase
        .from("harumoney_passes")
        .select("id, price_usdt, self_reward_pct, reward_mode")
        .eq("reward_mode", "rate");
      if (selErr) throw selErr;

      const updates =
        (rateRows ?? []).map((r: any) => {
          const price = Number(r.price_usdt ?? 0);
          const selfP = Number(r.self_reward_pct ?? 0); // DB에는 % 숫자 그대로(예: 0.2 = 0.2%)
          const daily = price * (selfP / 100);          // 0.2% ⇒ price * 0.002
          return { id: String(r.id), daily_reward_usdt: Number(daily.toFixed(8)) };
        }) || [];

      if (updates.length > 0) {
        await Promise.all(
          updates.map((u) =>
            supabase
              .from("harumoney_passes")
              .update({ daily_reward_usdt: u.daily_reward_usdt })
              .eq("id", u.id)
          )
        );
      }
    }

    // ⭐ 0.5) users에서 ref_code → (wallet_address, name) 매핑 미리 로드
    const { data: userBasics, error: uErr } = await supabase
      .from("users")
      .select("ref_code, wallet_address, name");
    if (uErr) throw uErr;

    const walletByRef = new Map<string, string>();
    const nameByRef = new Map<string, string>();
    (userBasics ?? []).forEach((u) => {
      if (u?.ref_code) {
        if (u.wallet_address) walletByRef.set(u.ref_code, String(u.wallet_address));
        if (u.name) nameByRef.set(u.ref_code, String(u.name));
      }
    });

    // 1) 활성 패스 로드
    const { data: passes, error: pErr } = await supabase
      .from("harumoney_passes")
      .select(
        "id, ref_code, center_ref_code, price_usdt, reward_mode, daily_reward_usdt, self_reward_pct, center_reward_pct, is_active, expired_at"
      );
    if (pErr) throw pErr;

    const active = (passes ?? []).filter((r: PassRow) => {
      if (!r.is_active) return false;
      if (!r.expired_at) return true;
      return r.expired_at.slice(0, 10) >= today;
    }) as PassRow[];

    // 2) 보상 집계
    const selfMap = new Map<string, number>();
    const centerMap = new Map<string, number>();

    for (const r of active) {
      const price = Number(r.price_usdt ?? 0);
      const daily = Number(r.daily_reward_usdt ?? 0); // 최신 daily (self 기준)
      const centerPct = Number(r.center_reward_pct ?? 0);

      let selfAmt = 0;
      let centerAmt = 0;

      if (r.reward_mode === "fixed") {
        selfAmt = daily;
        centerAmt = 0;
      } else {
        selfAmt = daily; // rate의 self는 이미 daily에 반영됨
        centerAmt = price * (centerPct / 100);
      }

      if (selfAmt > 0) {
        selfMap.set(r.ref_code, (selfMap.get(r.ref_code) ?? 0) + selfAmt);
      }
      if (centerAmt > 0 && r.center_ref_code) {
        centerMap.set(
          r.center_ref_code,
          (centerMap.get(r.center_ref_code) ?? 0) + centerAmt
        );
      }
    }

    // 3) reward_transfers 저장(수동 upsert) — 이름/지갑주소 함께 저장
    for (const [ref_code, amount] of selfMap.entries()) {
      await upsertRewardRow({
        ref_code,
        reward_amount: amount,
        center_amount: 0,
        total_amount: amount,
        status: "pending",
        reward_date: today,
        memo: "daily-self",
        wallet_address: walletByRef.get(ref_code) ?? null, // ⭐ 추가
        name: nameByRef.get(ref_code) ?? null,             // ⭐ 추가
      });
    }

    for (const [ref_code, amount] of centerMap.entries()) {
      await upsertRewardRow({
        ref_code, // 센터 코드
        reward_amount: 0,
        center_amount: amount,
        total_amount: amount,
        status: "pending",
        reward_date: today,
        memo: "daily-center",
        wallet_address: walletByRef.get(ref_code) ?? null, // ⭐ 추가
        name: nameByRef.get(ref_code) ?? null,             // ⭐ 추가
      });
    }

    return NextResponse.json({
      success: true,
      message: "daily_reward_usdt 갱신 + 오늘 리워드 계산/저장 완료(이름/지갑주소 포함)",
      counts: { self: selfMap.size, center: centerMap.size },
      date: today,
    });
  } catch (e: any) {
    console.error("❌ calc-today 실패:", e?.message || e);
    return NextResponse.json(
      { success: false, message: e?.message || "calc error" },
      { status: 500 }
    );
  }
}
