import { NextResponse } from "next/server";
import { calculateFullRewards } from "@/lib/rewards/calculateFullRewards";
import { saveToRewardTransfers } from "@/lib/rewards/saveToRewardTransfers";

export async function POST() {
  return handleSnapshot();
}

export async function GET() {
  return handleSnapshot();
}

async function handleSnapshot() {
  try {
    await calculateFullRewards();          // 투자/추천/센터 리워드 계산 및 저장
    await saveToRewardTransfers();         // 총합 계산하여 reward_transfers 저장

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ 스냅샷 작업 실패:", error);
    return NextResponse.json(
      { error: "스냅샷 작업 실패", detail: error },
      { status: 500 }
    );
  }
}
