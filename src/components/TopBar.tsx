'use client';

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { supabase } from "@/lib/supabaseClient";


export default function TopBar() {
  const account = useActiveAccount();
  const [myPoint, setMyPoint] = useState(0);


  return (
    <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
      {/* ✅ 왼쪽은 고정 텍스트 */}
      <div className="font-bold text-lg">HARU MONEY</div>

      <div className="flex items-center gap-3 text-sm">
        <Bell className="w-5 h-5" />
      </div>
    </div>
  );
}
