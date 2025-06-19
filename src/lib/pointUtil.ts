// lib/pointUtil.ts
import { supabase } from "@/lib/supabaseClient";
import { getKSTISOString } from "@/lib/dateUtil";

// 포인트 적립
export const addPointToUser = async (user: any, amount: number, source: string, memo: string) => {
  if (!user) return;

  const { error } = await supabase.from("point_history").insert({
    user_id: user.id,
    name: user.name,
    wallet_address: user.wallet_address,
    ref_code: user.ref_code,
    change_type: "add",
    amount,
    source,
    memo,
    created_at: getKSTISOString(),
  });

  if (error) console.error("❌ 포인트 적립 실패:", error);
  else console.log("✅ 포인트 적립 완료:", source, amount);
};

// 총 포인트 조회
export const getUserTotalPoint = async (userId: string) => {
  const { data, error } = await supabase
    .from("point_history")
    .select("amount, change_type")
    .eq("user_id", userId);

  if (error) {
    console.error("❌ 포인트 총합 조회 실패:", error);
    return 0;
  }

  return data?.reduce((sum, row) => {
    return sum + (row.change_type === "add" ? row.amount : -row.amount);
  }, 0) || 0;
};
