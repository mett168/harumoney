'use client';

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import { supabase } from "@/lib/supabaseClient";
import { getKSTDateString } from "@/lib/dateUtil";
import { addPointToUser, getUserTotalPoint } from "@/lib/pointUtil";

type Mission = {
  icon: string;
  title: string;
  reward: string;
  completed: boolean;
};

export default function MissionPage() {
  const [myPoint, setMyPoint] = useState(0);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const account = useActiveAccount();

  useEffect(() => {
    const fetchStatusAndUser = async () => {
      const address = account?.address?.toLowerCase();
      if (!address) return;

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address)
        .maybeSingle();

      if (!userData) return;
      setUser(userData);

      const refCode = userData.ref_code;
      const today = getKSTDateString();

      const { data: questData } = await supabase
        .from("daily_quests")
        .select("type")
        .eq("ref_code", refCode)
        .eq("date", today)
        .eq("status", "completed");

      const types = questData?.map((item) => item.type) || [];

      const missionList: Mission[] = [
        {
          icon: "/icons/calendar.png",
          title: "매일 출석체크",
          reward: "5 포인트",
          completed: types.includes("checkin"),
        },
        {
          icon: "/icons/quiz.png",
          title: "데일리 퀴즈",
          reward: "5 포인트",
          completed: types.includes("quiz"),
        },
        {
          icon: "/icons/ads.png",
          title: "광고 보기",
          reward: "5 포인트",
          completed: types.includes("ad"),
        },
        {
          icon: "/icons/coinw.png",
          title: "카피 트레이딩",
          reward: "5 포인트",
          completed: types.includes("copytrading"),
        },
        {
          icon: "/icons/invite.png",
          title: "친구초대",
          reward: "5 포인트",
          completed: types.includes("invite"),
        },
      ];
      setMissions(missionList);

      const total = await getUserTotalPoint(userData.id);
      setMyPoint(total);
    };

    fetchStatusAndUser();
  }, [account]);

const handleMissionReward = async (type: string, title: string) => {
  if (!user) return;

  const today = getKSTDateString();

  // ✅ 기존 기록 조회
  const { data: existing, error: selectError } = await supabase
    .from("daily_quests")
    .select("id")
    .eq("ref_code", user.ref_code)
    .eq("date", today)
    .eq("type", type)
    .maybeSingle();

  if (selectError) {
    alert(`❌ ${title} 리워드 조회 실패: ${selectError.message}`);
    return;
  }

  let saveError = null;

  if (existing) {
    // ✅ 있으면 update
    const { error: updateError } = await supabase
      .from("daily_quests")
      .update({ status: "completed" })
      .eq("id", existing.id);

    saveError = updateError;
  } else {
    // ✅ 없으면 insert
    const { error: insertError } = await supabase
      .from("daily_quests")
      .insert({
        ref_code: user.ref_code,
        date: today,
        type,
        status: "completed",
      });

    saveError = insertError;
  }

  // ✅ 후속 처리
  if (!saveError) {
    await addPointToUser(user, 5, type, `${title} 보상`);
    const total = await getUserTotalPoint(user.id);
    setMyPoint(total);
    setMissions((prev) =>
      prev.map((m) =>
        m.title === title ? { ...m, completed: true } : m
      )
    );
  } else {
    alert(`❌ ${title} 리워드 저장 실패: ${saveError.message}`);
  }
};

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-24">
      {/* 상단바 */}
      <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-lg">HARU REWARD</div>
        <div className="flex items-center gap-3 text-sm">
          <img src="/icons/coin.png" alt="coin" className="w-5 h-5" />
          <span className="text-yellow-300 font-semibold">{myPoint} Point</span>
          <Bell className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-2">
        <AdBanner />
      </div>

      <div className="mt-5 px-4">
        <div className="bg-white rounded-2xl shadow-md border p-4 space-y-4">
          {missions.map((mission, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-2 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <img src={mission.icon} alt="icon" className="w-16 h-16" />
                <div>
                  <p className="text-[16px] font-semibold text-gray-700">{mission.title}</p>
                  <p className="text-sm text-gray-500">{mission.reward}</p>
                </div>
              </div>

              {mission.completed ? (
                <span className="text-base font-semibold text-gray-500 bg-gray-200 px-5 py-2 rounded-full">
                  완료
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (mission.title === "광고 보기") {
                      window.open("https://youtube.com/shorts/qO7Vd-eL3ko", "_blank");
                    }
                    if (mission.title === "카피 트레이딩") {
                      router.push("/mission/copytrading");
                      return;
                    }
                    if (mission.title === "친구초대") {
                      router.push("/invite");
                    }
                    // ✅ 포인트 처리
                    const typeMap: Record<string, string> = {
                      "매일 출석체크": "checkin",
                      "데일리 퀴즈": "quiz",
                      "광고 보기": "ad",
                      "카피 트레이딩": "copytrading",
                      "친구초대": "invite",
                    };
                    handleMissionReward(typeMap[mission.title], mission.title);
                  }}
                  className="text-base font-semibold text-white bg-blue-500 px-5 py-2 rounded-full hover:bg-blue-600"
                >
                  받기
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
