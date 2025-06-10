"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";
import { polygon } from "thirdweb/chains";
import { Home } from "lucide-react";

import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { getOnchainNFTBalances } from "@/lib/getOnchainNFTBalances";
import { client } from "@/lib/client";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@supabase/auth-helpers-react";
import { getKSTDateString } from "@/lib/dateUtil";

type NFTType = "nft300" | "nft3000" | "nft10000";

const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

export default function HomePage() {
  const account = useActiveAccount();
  const address = account?.address?.toLowerCase() || "0x0000000000000000000000000000000000000000";
  const session = useSession();
  const router = useRouter();
  const balanceCalled = useRef(false);

  useEffect(() => {
    const invalid =
      !account?.address ||
      account.address === "0x0000000000000000000000000000000000000000";

    if (invalid) {
      console.warn("⚠️ 유효하지 않은 지갑 주소. 로그인 페이지로 이동합니다.");
      router.replace("/");
    }
  }, [account?.address]);

  const [usdtBalance, setUsdtBalance] = useState("조회 중...");
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [investReward, setInvestReward] = useState(0);
  const [referralReward, setReferralReward] = useState(0);

  const usdtContract = useMemo(() => getContract({ client, chain: polygon, address: USDT_ADDRESS }), []);

  const fetchUSDTBalance = async () => {
    if (!account?.address) return;

    try {
      const result = await balanceOf({ contract: usdtContract, address: account.address });
      const formatted = (Number(result) / 1e6).toFixed(2);
      localStorage.setItem("usdt_balance", formatted);
      setUsdtBalance(`${formatted} USDT`);
    } catch (err) {
      console.error("❌ USDT 잔액 조회 실패:", err);
      setUsdtBalance("0.00 USDT");
    }
  };

  useEffect(() => {
    if (account && !balanceCalled.current) {
      balanceCalled.current = true;
      fetchUSDTBalance();
      fetchTodayRewards();
      fetchUserInfo();
    }
  }, [account]);

  const fetchTodayRewards = async () => {
    if (!account?.address) return;
    const today = getKSTDateString();

    const { data: user } = await supabase
      .from("users")
      .select("ref_code")
      .eq("wallet_address", address)
      .maybeSingle();
    if (!user?.ref_code) return;

    const { data, error } = await supabase
      .from("reward_transfers")
      .select("reward_amount, referral_amount, center_amount")
      .eq("ref_code", user.ref_code)
      .eq("reward_date", today);

    if (error || !data || data.length === 0) {
      setInvestReward(0);
      setReferralReward(0);
      return;
    }

    const todayLog = data[0];
    const invest = Number(todayLog.reward_amount || 0);
    const referral = Number(todayLog.referral_amount || 0);
    const center = Number(todayLog.center_amount || 0);

    setInvestReward(invest);
    setReferralReward(referral + center);
  };

  const fetchUserInfo = async () => {
    const { data } = await supabase
      .from("users")
      .select("name, nickname")
      .eq("wallet_address", address)
      .maybeSingle();

    if (data) {
      setName(data.name || "");
      setNickname(data.nickname || "");
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#f5f7fa] pt-0 pb-20">
      <TopBar icon={<Home size={20} className="text-gray-700" />} title="홈" />
      <div className="max-w-[500px] mx-auto px-3 pt-2 space-y-2">

        {/* 오늘의 리워드 */}
        <section className="bg-white rounded-xl shadow px-4 py-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-800">오늘의 리워드</h3>
            <p className="text-2xl font-bold text-black">{(investReward + referralReward).toFixed(2)} USDT</p>
          </div>
          <div className="text-sm space-y-1">
            <p className="flex justify-between">
              <span className="text-gray-500">투자리워드</span>
              <span className="font-semibold text-gray-800">{investReward.toFixed(2)} USDT</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-500">추천리워드</span>
              <span className="font-semibold text-gray-800">{referralReward.toFixed(2)} USDT</span>
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-400">※ 매일 오전 9시 이전에 자동 입금됩니다.</p>
        </section>

      </div>
      <BottomNav />
    </main>
  );
}
