'use client';

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { supabase } from "@/lib/supabaseClient";
import { getUserTotalPoint } from "@/lib/pointUtil";

export default function TopBar() {
  const account = useActiveAccount();
  const [myPoint, setMyPoint] = useState(0);

  useEffect(() => {
    const fetchUserAndPoint = async () => {
      const address = account?.address?.toLowerCase();
      if (!address) return;

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", address)
        .maybeSingle();

      if (user) {
        const total = await getUserTotalPoint(user.id);
        setMyPoint(total);
      }
    };

    fetchUserAndPoint();
  }, [account]);

  return (
    <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
      <div className="font-bold text-lg">HARU REWARD</div>
      <div className="flex items-center gap-3 text-sm">
        <img src="/icons/coin.png" alt="coin" className="w-5 h-5" />
        <span className="text-yellow-300 font-semibold">{myPoint} Point</span>
        <Bell className="w-5 h-5" />
      </div>
    </div>
  );
}
