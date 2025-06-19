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
import { client } from "@/lib/client";
import { supabase } from "@/lib/supabaseClient";
import { getKSTDateString } from "@/lib/dateUtil";

export default function HomePage() {
  const account = useActiveAccount();
  const address = account?.address?.toLowerCase() || "0x0000000000000000000000000000000000000000";
  const router = useRouter();
  const balanceCalled = useRef(false);

  const [usdtBalance, setUsdtBalance] = useState("조회 중...");
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [refCode, setRefCode] = useState("");
  const [investReward, setInvestReward] = useState(0);
  const [referralReward, setReferralReward] = useState(0);
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [checkinDoneToday, setCheckinDoneToday] = useState(false);
  const [checkinHistory, setCheckinHistory] = useState<string[]>([]);
  const [quizDoneToday, setQuizDoneToday] = useState(false);
  const [questProgress, setQuestProgress] = useState(0);

  const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
  const usdtContract = useMemo(() => getContract({ client, chain: polygon, address: USDT_ADDRESS }), []);

  const fetchUserInfo = async () => {
    const { data } = await supabase.from("users").select("name, nickname, ref_code").eq("wallet_address", address).maybeSingle();
    if (data) {
      setName(data.name || "");
      setNickname(data.nickname || "");
      setRefCode(data.ref_code || "");
    }
  };

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

  const fetchTodayRewards = async () => {
    const today = getKSTDateString();
    const { data, error } = await supabase
      .from("reward_transfers")
      .select("reward_amount, referral_amount, center_amount")
      .eq("ref_code", refCode)
      .eq("reward_date", today);
    if (error || !data || data.length === 0) {
      setInvestReward(0);
      setReferralReward(0);
      return;
    }
    const todayLog = data[0];
    setInvestReward(Number(todayLog.reward_amount || 0));
    setReferralReward(Number(todayLog.referral_amount || 0) + Number(todayLog.center_amount || 0));
  };

  const fetchDailyQuestStatus = async () => {
    const today = getKSTDateString();
    const { data } = await supabase
      .from("daily_quests")
      .select("type")
      .eq("ref_code", refCode)
      .eq("date", today)
      .eq("status", "completed");
    const types = data?.map((item) => item.type) || [];
    let progress = 0;
    if (types.includes("quiz")) progress += 50;
    if (types.includes("checkin")) progress += 50;
    setQuestProgress(progress);
  };

  const fetchQuizHistory = async () => {
    const today = getKSTDateString();
    const { data } = await supabase
      .from("daily_quests")
      .select("date")
      .eq("ref_code", refCode)
      .eq("type", "quiz")
      .eq("status", "completed");
    const dates = data?.map((item) => item.date) || [];
    setQuizDoneToday(dates.includes(today));
  };

  const fetchDailyQuiz = async () => {
    const { data: user } = await supabase.from("users").select("daily_quiz_start_date").eq("wallet_address", address).maybeSingle();
    let startDate = user?.daily_quiz_start_date ? new Date(user.daily_quiz_start_date) : null;
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (!startDate) {
      startDate = todayOnly;
      await supabase.from("users").update({ daily_quiz_start_date: todayOnly.toISOString().split("T")[0] }).eq("wallet_address", address);
    }
    const diffDays = Math.floor((todayOnly.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const { data: quizList } = await supabase.from("daily_quizzes").select("*").order("id", { ascending: true });
    const todayQuiz = quizList?.[Math.min(diffDays, quizList.length - 1)];
    if (todayQuiz?.question) setQuiz(todayQuiz);
  };

  const handleAnswer = async (option: string) => {
    if (!quiz || isCorrect === true) return;
    setSelectedAnswer(option);
    const correct = option === quiz.correct_answer;
    setIsCorrect(correct);
    if (correct) {
 await supabase.from("daily_quests").upsert(
  [
    {
      ref_code: refCode,
      name,
      date: getKSTDateString(),
      type: "quiz",
      status: "completed",
    },
  ],
  {
    onConflict: "ref_code,date,type", // ✅ 문자열 하나
  }
);


      setQuizDoneToday(true);
      await fetchDailyQuestStatus();
    }
  };

  const fetchCheckinHistory = async () => {
    const today = getKSTDateString();
    const { data } = await supabase.from("daily_quests")
      .select("date")
      .eq("ref_code", refCode)
      .eq("type", "checkin")
      .eq("status", "completed");
    const dates = data?.map((item) => item.date) || [];
    setCheckinHistory(dates);
    setCheckinDoneToday(dates.includes(today));
  };

  const handleCheckin = async () => {
    if (checkinDoneToday) return;
 await supabase.from("daily_quests").upsert(
  [
    {
      ref_code: refCode,
      name,
      date: getKSTDateString(),
      type: "quiz",
      status: "completed",
    },
  ],
  {
    onConflict: "ref_code,date,type", // ✅ 문자열 하나
  }
);
    setCheckinDoneToday(true);
    setCheckinHistory((prev) => [...prev, getKSTDateString()]);
    await fetchDailyQuestStatus();
  };

  useEffect(() => {
    if (account && !balanceCalled.current) {
      balanceCalled.current = true;
      fetchUserInfo().then(() => {
        fetchUSDTBalance();
        fetchTodayRewards();
        fetchDailyQuiz();
        fetchCheckinHistory();
        fetchQuizHistory();
        fetchDailyQuestStatus();
      });
    }
  }, [account]);

  return (
    <main className="w-full min-h-screen bg-[#f5f7fa] pt-0 pb-20">
      <TopBar   />
      <div className="max-w-[500px] mx-auto px-3 pt-2 space-y-4">
        <div className="w-full rounded-xl overflow-hidden shadow border bg-white">
          <img src="/ads/ad1.png" alt="광고" className="w-full h-24 object-cover" />
        </div>

        <section className="bg-white rounded-xl shadow border px-5 py-4">
          <h3 className="text-sm font-bold text-gray-800 mb-1">일일 퀘스트</h3>
          <div className="relative w-full bg-gray-200 h-5 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${questProgress}%` }}></div>
          </div>
          <div className="mt-2 flex justify-center">
            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {questProgress}% 달성
            </span>
          </div>
        </section>

        {quiz && (
          <section className="bg-white rounded-xl shadow border px-5 py-6">
            <h3 className="text-sm font-bold text-blue-600 mb-2">데일리 퀴즈</h3>
            <p className="text-base font-semibold text-gray-900 mb-4">{quiz.question}</p>
            <div className="space-y-3">
              {[quiz.option_1, quiz.option_2, quiz.option_3].map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isAnswer = quiz.correct_answer === option;
                let buttonClass = "bg-gray-100 text-gray-800 border border-gray-200";
                let icon = "⬜️";

                if (selectedAnswer) {
                  if (option === quiz.correct_answer) {
                    buttonClass = "bg-green-100 border-green-500 text-green-700";
                    icon = "✅";
                  } else if (option === selectedAnswer && !isAnswer) {
                    buttonClass = "bg-red-100 border-red-500 text-red-700";
                    icon = "❌";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={isCorrect === true}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium shadow-sm transition-all duration-300 ${buttonClass}`}
                  >
                    <span>{option}</span>
                    <span>{icon}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl shadow border px-5 py-6">
          <h3 className="text-sm font-semibold text-blue-600 mb-2">📅 출석체크</h3>
          <div className="grid grid-cols-5 gap-3 mb-4">
            {[...Array(10)].map((_, idx) => {
              const checked = idx < checkinHistory.length;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <img
                    src={checked ? "/icons/check_active.png" : "/icons/check_inactive.png"}
                    alt="check"
                    className="w-8 h-8 mb-1"
                  />
                  <div className="text-[11px] text-gray-700">{idx + 1}일차</div>
                </div>
              );
            })}
          </div>

          {!checkinDoneToday ? (
            <button
              onClick={handleCheckin}
              className="w-full bg-blue-500 text-white text-sm font-semibold py-2 rounded-lg"
            >
              오늘 출석하기
            </button>
          ) : (
            <div className="text-center text-green-600 font-semibold">
              오늘 출석 완료! <span className="text-sm text-blue-600">+10포인트</span>
            </div>
          )}
        </section>
      </div>
      <BottomNav />
    </main>
  );
}