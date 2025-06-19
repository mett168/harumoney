"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function MyPage() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [editingField, setEditingField] = useState<"name" | "phone" | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!account?.address) return;

      const { data: user, error } = await supabase
        .from("users")
        .select("name, phone, email, created_at, ref_by, joined_at")
        .eq("wallet_address", account.address.toLowerCase())
        .maybeSingle();

      if (!user) return;

      let refName = null;
      if (user.ref_by) {
        const { data: refUser } = await supabase
          .from("users")
          .select("name")
          .eq("ref_code", user.ref_by)
          .maybeSingle();
        refName = refUser?.name || null;
      }

      setUserData({
        ...user,
        ref_by_name: refName,
      });
    };

    fetchUserData();
  }, [account]);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("logged_out", "true");
      window.location.replace("/");
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
      alert("로그아웃 중 문제가 발생했습니다.");
    }
  };

  const handleCopy = () => {
    if (!account?.address) return;
    navigator.clipboard.writeText(account.address);
    alert("주소가 복사되었습니다.");
  };

  if (!account) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <p className="text-gray-500 text-sm">지갑 주소 불러오는 중...</p>
      </main>
    );
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[#f5f7fa] pb-16 w-full">
        <div className="px-4 pt-2 max-w-[500px] mx-auto">

          {/* ✅ 지갑 입금 주소 */}
          <section className="mb-4 bg-white p-4 rounded-xl shadow">
            <h2 className="text-blue-600 font-semibold mb-2">나의 지갑 입금 주소</h2>
            <p className="text-sm break-all">{account.address}</p>
            <p className="text-xs text-gray-500 mt-1">
              ※ 해당 주소는 POLYGON 체인의 USDT 입금만 지원됩니다.
            </p>
            <button
              className="mt-2 w-full bg-blue-100 text-blue-700 py-1 rounded text-sm font-semibold"
              onClick={handleCopy}
            >
              📋 주소 복사하기
            </button>
          </section>

          {/* ✅ 코인 자산 */}
          <section className="mb-4 bg-white p-4 rounded-xl shadow">
            <h2 className="text-blue-600 font-semibold mb-2">나의 코인 자산</h2>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Tether</span>
              <span>0.00 USDT</span>
            </div>
            <button
              className="mt-2 w-full bg-blue-600 text-white py-1 rounded text-sm font-semibold"
              onClick={() => router.push("/withdraw")}
            >
              출금하기
            </button>
          </section>

          {/* ✅ NFT 자산 */}
          <section className="mb-4 bg-white p-4 rounded-xl shadow">
            <h2 className="text-blue-600 font-semibold mb-2">나의 NFT 자산</h2>
            {[
              { name: "SNOWBOT 300", image: "/snowbot300.png", amount: 0 },
              { name: "SNOWBOT 3000", image: "/snowbot3000.png", amount: 0 },
              { name: "SNOWBOT 10000", image: "/snowbot10000.png", amount: 0 },
            ].map((nft, idx) => (
              <div key={idx} className="flex items-center gap-3 mt-2">
                <Image src={nft.image} alt={nft.name} width={50} height={50} className="rounded" />
                <div>
                  <p className="font-bold">{nft.name}</p>
                  <p className="text-sm text-gray-500">보유 수량: {nft.amount}개</p>
                </div>
              </div>
            ))}
          </section>

          {/* 계정관리 */}
          <section className="mb-2">
            <h2 className="text-md font-semibold text-gray-700 mb-1 pl-2">계정관리</h2>
            <div className="bg-white rounded-xl shadow border text-sm divide-y divide-gray-200">
              {/* 이름 */}
              <div className="flex justify-between px-4 py-3 items-center">
                <span>내 이름</span>
                {editingField === "name" ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="text-sm border rounded px-2 py-1 w-28"
                    />
                    <button
                      onClick={async () => {
                        const { error } = await supabase
                          .from("users")
                          .update({ name: nameInput })
                          .eq("wallet_address", account.address.toLowerCase());

                        if (!error) {
                          setEditingField(null);
                          setUserData({ ...userData, name: nameInput });
                        }
                      }}
                      className="text-blue-500 text-sm"
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-800">
                    {userData?.name || "-"}{" "}
                    <span
                      className="text-blue-500 cursor-pointer text-sm"
                      onClick={() => {
                        setEditingField("name");
                        setNameInput(userData?.name || "");
                      }}
                    >
                      수정
                    </span>
                  </span>
                )}
              </div>

              {/* 휴대폰 번호 */}
              <div className="flex justify-between px-4 py-3 items-center">
                <span>휴대폰 번호</span>
                {editingField === "phone" ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="text-sm border rounded px-2 py-1 w-28"
                    />
                    <button
                      onClick={async () => {
                        const { error } = await supabase
                          .from("users")
                          .update({ phone: phoneInput })
                          .eq("wallet_address", account.address.toLowerCase());

                        if (!error) {
                          setEditingField(null);
                          setUserData({ ...userData, phone: phoneInput });
                        }
                      }}
                      className="text-blue-500 text-sm"
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-800">
                    {userData?.phone || "-"}{" "}
                    <span
                      className="text-blue-500 cursor-pointer text-sm"
                      onClick={() => {
                        setEditingField("phone");
                        setPhoneInput(userData?.phone || "");
                      }}
                    >
                      수정
                    </span>
                  </span>
                )}
              </div>

              {/* 이메일 */}
              <div className="flex justify-between px-4 py-3">
                <span>가입 이메일</span>
                <span className="text-gray-800">{userData?.email || "-"}</span>
              </div>

              {/* 가입 일시 */}
              <div className="flex justify-between px-4 py-3">
                <span>가입 일시</span>
                <span className="text-gray-800">
                  {userData?.joined_at
                    ? userData.joined_at.slice(0, 19).replace("T", " ")
                    : "-"}
                </span>
              </div>

              {/* 추천인 */}
              <div className="flex justify-between px-4 py-3">
                <span>추천인</span>
                <span className="text-gray-800">{userData?.ref_by_name || "-"}</span>
              </div>
            </div>
          </section>

          {/* 내역관리 */}
          <section className="mb-2">
            <h2 className="text-md font-semibold text-gray-700 mb-1 pl-2">내역관리</h2>
            <div className="bg-white rounded-xl shadow border text-sm divide-y divide-gray-200">
              {[
                { label: "NFT 구매 내역", path: "/mypage/history/nft-purchase" },
                { label: "NFT 양도 내역", path: "/mypage/history/nft-transfer" },
                { label: "NFT 해지 내역", path: "/mypage/history/nft-burn" },
                { label: "USDT 입출금 내역", path: "/mypage/history/usdt" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(item.path)}
                  className="w-full px-4 py-3 hover:bg-gray-50 flex justify-between items-center"
                >
                  <span>{item.label}</span>
                  <img src="/icon-go.png" alt="이동" className="w-4 h-4" />
                </button>
              ))}
            </div>
          </section>

          {/* 문의 */}
          <section className="space-y-4 mb-2">
            <a
              href="http://pf.kakao.com/_rxaxmGn/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white p-4 rounded-xl shadow flex justify-between items-center hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <img src="/icon-question.png" alt="문의" className="w-5 h-5" />
                <span className="text-sm">1:1 문의하기</span>
              </div>
              <img src="/icon-link.png" alt="이동" className="w-4 h-4" />
            </a>
          </section>

          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold mb-4"
          >
            로그아웃
          </button>
        </div>
        <BottomNav />
      </main>
    </>
  );
}
