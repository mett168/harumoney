import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getKSTISOString, getKSTDateString } from "@/lib/dateUtil";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ 기본 스타터 패스 정책(원하면 .env 또는 설정테이블로 분리 가능)
const STARTER_PASS = {
  code: "HM1000",
  name: "하루머니 1000",
  price: 1000,
  rewardMode: "rate" as const,   // 'fixed' | 'rate'
  selfPct: 0.1,                  // 본인 리워드 %
  centerPct: 0.02,               // 센터 리워드 %
};

async function generateNextReferralCode(): Promise<string> {
  const { data, error } = await supabase
    .from("users")
    .select("ref_code")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;

  let newNumber = 10000;
  if (data?.length && data[0].ref_code?.startsWith("HM")) {
    const lastNum = parseInt(data[0].ref_code.slice(2));
    newNumber = lastNum + 1;
  }
  return `HM${newNumber}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    wallet_address,
    email = "",
    phone = "01000000000",
    ref_by = "HM10000",
    name = "",
  } = body;

  if (!wallet_address) {
    return NextResponse.json({ error: "지갑 주소는 필수입니다." }, { status: 400 });
  }

  const normalizedAddress = wallet_address.toLowerCase();

  // 이미 등록된 유저?
  const { data: existing, error: lookupError } = await supabase
    .from("users")
    .select("id, ref_code")
    .eq("wallet_address", normalizedAddress)
    .maybeSingle();
  if (lookupError) {
    return NextResponse.json({ error: "유저 조회 실패" }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({
      message: "이미 등록된 유저입니다.",
      id: existing.id,
      ref_code: existing.ref_code,
    });
  }

  // 추천인 → 센터 계산
  let center_id = "HM10000";
  const { data: referrer } = await supabase
    .from("users")
    .select("role, center_id, ref_code")
    .eq("ref_code", ref_by)
    .maybeSingle();
  if (referrer) {
    center_id = referrer.role === "center" ? referrer.ref_code : (referrer.center_id || "HM10000");
  }

  // 신규 ref_code
  const newRefCode = await generateNextReferralCode();
  const finalName = name?.trim() || null;

  // KST 기준 시각/날짜
  const joinedAt = getKSTISOString();
  const joinedDate = getKSTDateString();

  // 유저 등록
  const { data: inserted, error: insertError } = await supabase
    .from("users")
    .insert({
      wallet_address: normalizedAddress,
      email,
      phone,
      name: finalName,
      ref_code: newRefCode,
      ref_by,
      center_id,
      role: "user",
      joined_at: joinedAt,
      joined_date: joinedDate,
    })
    .select("id, ref_code")
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 🧩 기본 Pass 지급 (중복지급 방지: 존재하면 업데이트, 없으면 생성)
  const passPayload = {
    ref_code: inserted.ref_code,
    pass_code: STARTER_PASS.code,
    name: STARTER_PASS.name,
    price_usdt: STARTER_PASS.price,
    reward_mode: STARTER_PASS.rewardMode,
    self_reward_pct: STARTER_PASS.selfPct,
    center_reward_pct: STARTER_PASS.centerPct,
    purchased_at: joinedAt,
    activated_at: joinedAt,
    expired_at: null,
    is_active: true,
    memo: "신규 회원 기본 패스 지급",
    // 스냅샷 메타(운영 필수 기본)
    wallet_address: normalizedAddress,
    center_ref_code: center_id,
    inviter_ref_code: ref_by,
    granted_by: "SYSTEM", // 또는 운영자 코드
  };

  // 활성 동일 패스 보유 여부 확인
  const { data: existPass } = await supabase
    .from("harumoney_passes")
    .select("id")
    .eq("ref_code", inserted.ref_code)
    .eq("pass_code", STARTER_PASS.code)
    .eq("is_active", true)
    .maybeSingle();

  if (existPass?.id) {
    // 이미 있으면 최신 정책으로 정정(스냅샷 갱신)
    const { error: updErr } = await supabase
      .from("harumoney_passes")
      .update(passPayload)
      .eq("id", existPass.id);
    if (updErr) console.error("❌ 기본 Pass 갱신 실패:", updErr.message);
  } else {
    const { error: passError } = await supabase
      .from("harumoney_passes")
      .insert(passPayload);
    if (passError) console.error("❌ 기본 Pass 지급 실패:", passError.message);
  }

  return NextResponse.json({
    message: "등록 완료 + 기본 Pass 지급",
    id: inserted.id,
    ref_code: inserted.ref_code,
  });
}
