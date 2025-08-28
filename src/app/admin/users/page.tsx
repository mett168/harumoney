"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { polygon } from "thirdweb/chains";
import { client } from "@/lib/client";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";

const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");

type User = {
  id: string;
  name: string;
  email: string;
  wallet_address: string;
  ref_code: string;
  created_at: string;
  usdt?: string;
  matic?: string;
};

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsersWithAssets = async () => {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email, wallet_address, ref_code, created_at")
        .order("created_at", { ascending: false });

      if (userError || !userData) {
        console.error("❌ 유저 조회 실패:", userError?.message);
        return;
      }

      const enrichedUsers: User[] = await Promise.all(
        userData.map(async (user) => {
          const wallet = user.wallet_address.toLowerCase();
          let usdt = "0";
          let matic = "0";

          try {
            console.log("🧾 잔액조회 요청 주소:", wallet);
            if (!ethers.utils.isAddress(wallet)) throw new Error("유효하지 않은 주소");

            const usdtContract = new ethers.Contract(
              USDT_ADDRESS,
              ["function balanceOf(address) view returns (uint256)"],
              provider
            );

            const usdtRaw = await usdtContract.balanceOf(wallet);
            console.log("✅ USDT Raw:", usdtRaw.toString());
            usdt = ethers.utils.formatUnits(usdtRaw, 6);

            const maticRaw = await provider.getBalance(wallet);
            matic = parseFloat(ethers.utils.formatEther(maticRaw)).toFixed(4);
          } catch (e) {
            console.warn("❌ 잔액 조회 실패:", wallet, e);
          }

          return {
            ...user,
            usdt,
            matic,
          };
        })
      );

      setUsers(enrichedUsers);
      setLoading(false);
    };

    fetchUsersWithAssets();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">👥 유저 관리</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] text-sm border border-gray-300 table-auto">
          <thead className="bg-gray-200 text-center">
            <tr>
              <th className="p-2 border">이름</th>
              <th className="p-2 border">이메일</th>
              <th className="p-2 border">추천코드</th>
              <th className="p-2 border w-[240px]">지갑주소</th>
              <th className="p-2 border">가입일</th>
              <th className="p-2 border">USDT</th>
              <th className="p-2 border">POL</th>
              <th className="p-2 border">기능</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="text-center">
                <td className="p-2 border">{u.name || "-"}</td>
                <td className="p-2 border">{u.email || "-"}</td>
                <td className="p-2 border">{u.ref_code || "-"}</td>
                <td className="p-2 border font-mono text-xs truncate max-w-[240px]">{u.wallet_address}</td>
                <td className="p-2 border">{new Date(u.created_at).toLocaleDateString("ko-KR")}</td>
                <td className="p-2 border">{u.usdt}</td>
                <td className="p-2 border">{u.matic}</td>
                <td className="p-2 border space-y-1">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                  >
                  </button>
                  <br />
                  <button
                    onClick={() => router.push(`/admin/usdt-history/${u.ref_code}`)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                  >
                    USDT 내역
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
