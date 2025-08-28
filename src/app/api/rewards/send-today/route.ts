import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getKSTISOString } from "@/lib/dateUtil";
import { sendUSDT } from "@/lib/sendUSDT"; // ✅ 프로젝트에 있는 송금 유틸 사용
// sendUSDT(to: string, amount: number): Promise<{ txHash: string }>

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type TransferRow = {
  id: string;
  ref_code: string;
  wallet_address: string | null;
  total_amount: number | null;
  status: 'pending'|'sent'|'failed'|'success';
  memo?: string | null;
};

export async function POST(_req: NextRequest) {
  const today = getKSTISOString().slice(0,10);

  try {
    // 1) 오늘자 미지급 대상 로드
    const { data, error } = await supabase
      .from("reward_transfers")
      .select("id, ref_code, wallet_address, total_amount, status, memo")
      .eq("reward_date", today)
      .eq("status", "pending");
    if (error) throw error;

    const targets = (data ?? []) as TransferRow[];
    if (targets.length === 0) {
      return NextResponse.json({ success: true, message: "오늘 미지급 대상이 없습니다." });
    }

    const results: Array<{id:string; ref_code:string; ok:boolean; tx?:string; err?:string}> = [];

    // 2) 순차 송금
    for (const row of targets) {
      const amount = Number(row.total_amount ?? 0);
      const to     = (row.wallet_address ?? '').trim();
      if (!to || amount <= 0) {
        // 잘못된 대상 → failed 처리
        await supabase.from("reward_transfers").update({
          status: 'failed',
          error_message: !to ? 'NO_WALLET' : 'ZERO_AMOUNT',
          executed_at: getKSTISOString()
        }).eq('id', row.id);
        results.push({ id: row.id, ref_code: row.ref_code, ok:false, err: !to ? '지갑주소 없음' : '금액 0' });
        continue;
      }

      try {
        // 2-1) 실제 송금
        const { transactionHash: txHash } = await sendUSDT(to, amount);

        // 2-2) 성공 업데이트
        await supabase.from("reward_transfers").update({
          status: 'sent',                 // 프로젝트에서 'success' 사용 중이면 'success'로 통일해도 됩니다.
          tx_hash: txHash,
          executed_at: getKSTISOString(),
          error_message: 'EMPTY'
        }).eq('id', row.id);

        results.push({ id: row.id, ref_code: row.ref_code, ok:true, tx: txHash });
      } catch (e:any) {
        // 2-3) 실패 업데이트
        await supabase.from("reward_transfers").update({
          status: 'failed',
          error_message: e?.message || 'send error',
          executed_at: getKSTISOString()
        }).eq('id', row.id);

        results.push({ id: row.id, ref_code: row.ref_code, ok:false, err: e?.message || 'send error' });
      }
    }

    const ok = results.filter(r => r.ok).length;
    const fail = results.length - ok;

    return NextResponse.json({
      success: true,
      message: `송금 완료: 성공 ${ok}건 / 실패 ${fail}건`,
      results
    });
  } catch (e:any) {
    console.error("❌ send-today 실패:", e?.message || e);
    return NextResponse.json({ success:false, message: e?.message || 'send error' }, { status: 500 });
  }
}
