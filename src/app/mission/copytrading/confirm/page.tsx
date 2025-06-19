'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useActiveAccount } from "thirdweb/react";
import { supabase } from "@/lib/supabaseClient";

export default function CopyConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();
  const account = useActiveAccount();

  const passName = params.get("pass") || "Copy Pass";
  const [uid, setUid] = useState("");

  const handleSubmit = async () => {
    if (!uid) {
      alert("❌ UID를 입력해주세요.");
      return;
    }

    if (!account?.address) {
      alert("❌ 지갑 연결이 필요합니다.");
      return;
    }

    // ✅ 유저 정보 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("ref_code, name")
      .eq("wallet_address", account.address.toLowerCase())
      .maybeSingle();

    if (userError || !user?.ref_code || !user?.name) {
      alert("❌ 사용자 정보 조회 실패");
      return;
    }

    // ✅ UID만 DB 저장
    const { error: insertError } = await supabase.from("copytrading_passes").insert({
      ref_code: user.ref_code,
      user_name: user.name,
      pass_name: passName,
      uid,
    });

    if (insertError) {
      alert("❌ 제출 저장 실패: " + insertError.message);
      return;
    }

    // ✅ 완료 페이지로 이동
    router.push("/mission/copytrading/success");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-24">
      <TopBar title={passName} showBack />

      {/* 제목 */}
      <div className="text-center mt-6 px-4">
        <h1 className="text-[20px] font-bold text-gray-900">{passName}</h1>
        <p className="text-sm text-blue-600 mt-1">참여 방법</p>
      </div>

      {/* 안내 */}
      <div className="mt-6 px-4 space-y-3 text-sm text-gray-800">
        {[
          {
            step: "1",
            text: (
              <>
                아래 링크로 CoinW 회원가입을 진행해주세요. <br />
                <a
                  href="https://www.coinw.com/en_US/register?r=3404756"
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  👉 가입 링크 바로가기
                </a>
              </>
            ),
          },
          { step: "2", text: "페이지 하단에 나의 CoinW UID를 입력해주세요." },
          { step: "3", text: "1000 USDT 이상 Copy Trading 후 인증 제출해주세요." },
        ].map(({ step, text }, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
          >
            <p className="font-bold mb-1 text-blue-500">Step {step}</p>
            <div>{text}</div>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="mt-8 px-4 space-y-5">
        {/* UID 입력 */}
        <div>
          <label className="text-sm font-bold text-gray-700">UID 입력하기</label>
          <input
            type="text"
            placeholder="UID를 입력하세요"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="mt-2 w-full border border-gray-300 px-4 py-2 rounded-lg"
          />
        </div>

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl"
        >
          제출하기
        </button>
      </div>
    </div>
  );
}
