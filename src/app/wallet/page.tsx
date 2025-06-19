'use client';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";
import { polygon } from "thirdweb/chains";

import TopBar from '@/components/TopBar';
import AdBanner from '@/components/AdBanner';
import BottomNav from '@/components/BottomNav';
import { client } from "@/lib/client";
import { supabase } from "@/lib/supabaseClient";

const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

export default function WalletPage() {
  const account = useActiveAccount();
  const router = useRouter();
  const [usdtBalance, setUsdtBalance] = useState("0.000");
  const [pointBalance, setPointBalance] = useState(0);

  const usdtContract = useMemo(() => {
    return getContract({ client, chain: polygon, address: USDT_ADDRESS });
  }, []);

  useEffect(() => {
    const fetchUSDTBalance = async () => {
      if (!account?.address) return;

      try {
        const result = await balanceOf({ contract: usdtContract, address: account.address });
        const formatted = (Number(result) / 1e6).toFixed(3);
        setUsdtBalance(formatted);
      } catch (err) {
        console.error("❌ USDT 잔액 불러오기 실패:", err);
        setUsdtBalance("0.000");
      }
    };

    const fetchPointBalance = async () => {
      if (!account?.address) return;

      const { data, error } = await supabase
        .from("point_history")
        .select("amount")
        .eq("wallet_address", account.address.toLowerCase());

      if (!error && data) {
        const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
        setPointBalance(total);
      }
    };

    fetchUSDTBalance();
    fetchPointBalance();
  }, [account, usdtContract]);

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-28">
      <TopBar title={`지갑 (포인트 ${pointBalance})`} />

      {/* 광고 배너 */}
      <div className="px-0 mt-2">
        <AdBanner />
      </div>

      <div className="px-4 mt-4 space-y-6">
        {/* USDT 자산 카드 */}
        <section className="bg-gradient-to-r from-cyan-400 to-indigo-400 text-white rounded-2xl p-5 shadow-lg">
          <div className="text-sm font-medium mb-1 text-white/80">보유 자산</div>
          <div className="text-3xl font-bold mb-5 tracking-wide flex items-center gap-1">
            {usdtBalance} <span className="text-lg font-semibold">USDT</span>
          </div>
          <div className="flex justify-between text-sm font-semibold gap-2">
            <button
              onClick={() => router.push("/wallet/swap")}
              className="flex-1 bg-white text-cyan-600 rounded-full px-5 py-2 shadow-md border border-cyan-200 transition hover:-translate-y-0.5 active:shadow-inner"
            >
              교환
            </button>
            <button
              onClick={() => router.push("/wallet/send")}
              className="flex-1 bg-white text-cyan-600 rounded-full px-5 py-2 shadow-md border border-cyan-200 transition hover:-translate-y-0.5 active:shadow-inner"
            >
              보내기
            </button>
          </div>
        </section>

        {/* 포인트 자산 */}
        <section className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
          <span className="text-sm text-gray-700">보유 포인트</span>
          <div className="flex items-center gap-1">
            <img src="/icons/coin.png" alt="point" className="w-4 h-4" />
            <span className="text-yellow-500 font-bold text-sm">{pointBalance}</span>
          </div>
        </section>

        {/* PASS 카드 박스 */}
        <section className="bg-white rounded-xl shadow overflow-hidden">
          <h3 className="text-base font-bold text-blue-600 px-4 pt-4">보유 PASS</h3>
          <div className="mt-3">
            <img
              src="/pass_sample.png"
              alt="PASS 카드"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="px-4 py-3">
            <div className="font-semibold text-base">PASS1000</div>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}