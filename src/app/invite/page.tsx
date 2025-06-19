"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { supabase } from "@/lib/supabaseClient";

export default function InvitePage() {
  const account = useActiveAccount();
  const [refCode, setRefCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [invitees, setInvitees] = useState<any[]>([]);

  useEffect(() => {
    if (!account?.address) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("users")
        .select("ref_code")
        .eq("wallet_address", account.address.toLowerCase())
        .maybeSingle();

      if (data?.ref_code) {
        setRefCode(data.ref_code);
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setInviteLink(`${origin}/join?ref=${data.ref_code}`);
      }
    };

    fetch();
  }, [account]);

  useEffect(() => {
    if (!refCode) return;

    const loadInvitees = async () => {
      const { data } = await supabase
        .from("users")
        .select("name, created_at, total_reward, ref_code")
        .eq("ref_by", refCode)
        .order("created_at", { ascending: false });

      if (data) setInvitees(data);
    };

    loadInvitees();
  }, [refCode]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f2f7ff] pb-32">
      {/* 상단 영역 */}
      <div className="bg-[#457eff] text-white text-center pt-10 pb-20 rounded-b-3xl relative">
        <h1 className="text-xl font-bold">친구와 함께하는 하루리워드</h1>
        <img src="/icons/crown.png" className="w-16 h-16 mx-auto mt-4" />
      </div>

      {/* 카드 2개 */}
      <div className="px-5 mt-[-40px] space-y-3">
        <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4">
          <img src="/icons/invite.png" className="w-10 h-10" />
          <div>
            <p className="font-bold text-gray-800">친구 초대</p>
            <p className="text-sm text-gray-500">링크를 통해 친구를 초대하세요!</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4">
          <img src="/icons/coins.png" className="w-10 h-10" />
          <div>
            <p className="font-bold text-gray-800">매일 추가 리워드</p>
            <p className="text-sm text-gray-500">친구가 받는 리워드의 20%가 추가!</p>
          </div>
        </div>
      </div>

      {/* 친구 현황 */}
      <div className="px-5 mt-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-base font-bold text-gray-700">내 친구 현황</p>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </div>

        <div className="bg-white rounded-xl shadow p-3">
          {invitees.length > 0 ? (
            <table className="w-full text-sm text-center">
              <thead className="text-gray-600 border-b">
                <tr>
                  <th className="py-2">친구</th>
                  <th>누적 리워드</th>
                  <th>가입일</th>
                </tr>
              </thead>
              <tbody>
                {invitees.map((friend, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 font-medium">{friend.name}</td>
                    <td>{friend.total_reward || 0}</td>
                    <td>{friend.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-400 text-sm py-4">초대한 친구가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 초대링크 */}
      <div className="fixed bottom-16 w-full px-4 max-w-[500px]">
        <div className="bg-blue-100 rounded-xl p-4 shadow-md text-center">
          <p className="text-sm font-semibold text-blue-700 mb-2">친구초대 링크</p>
          <p className="text-xs break-all text-blue-800 font-mono">{inviteLink}</p>
          <button
            onClick={handleCopy}
            className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg font-bold text-sm"
          >
            {copied ? "✅ 복사됨" : "복사하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
