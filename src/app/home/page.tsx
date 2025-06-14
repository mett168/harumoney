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
import { useSession } from "@supabase/auth-helpers-react";
import { getKSTDateString } from "@/lib/dateUtil";

export default function HomePage() {
  const account = useActiveAccount();
  const address = account?.address?.toLowerCase() || "0x0000000000000000000000000000000000000000";
  const session = useSession();
  const router = useRouter();
  const balanceCalled = useRef(false);

  const [usdtBalance, setUsdtBalance] = useState("조회 중...");
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
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
    setInvestReward(Number(todayLog.reward_amount || 0));
    setReferralReward(Number(todayLog.referral_amount || 0) + Number(todayLog.center_amount || 0));
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

  const fetchDailyQuestStatus = async () => {
    const today = getKSTDateString();
    const { data, error } = await supabase
      .from("daily_quests")
      .select("type")
      .eq("wallet_address", address)
      .eq("date", today)
      .eq("status", "completed");
    if (error) {
      console.error("❌ 퀘스트 진행률 조회 실패:", error);
      return;
    }
    const types = data.map((item) => item.type);
    let progress = 0;
    if (types.includes("quiz")) progress += 50;
    if (types.includes("checkin")) progress += 50;
    setQuestProgress(progress);
  };

  const fetchQuizHistory = async () => {
    const today = getKSTDateString();
    const { data, error } = await supabase
      .from("daily_quests")
      .select("date")
      .eq("wallet_address", address)
      .eq("type", "quiz")
      .eq("status", "completed");
    if (error) {
      console.error("❌ 퀴즈 데이터 조회 실패:", error);
      return;
    }
    const dates = data.map((item) => item.date);
    setQuizDoneToday(dates.includes(today));
  };

  useEffect(() => {
    if (account && !balanceCalled.current) {
      balanceCalled.current = true;
      fetchUSDTBalance();
      fetchTodayRewards();
      fetchUserInfo();
      fetchDailyQuiz();
      fetchCheckinHistory();
      fetchQuizHistory();
      fetchDailyQuestStatus();
    }
  }, [account]);

  const fetchDailyQuiz = async () => {
    const { data: user } = await supabase
      .from("users")
      .select("daily_quiz_start_date")
      .eq("wallet_address", address)
      .maybeSingle();
    let startDate = user?.daily_quiz_start_date ? new Date(user.daily_quiz_start_date) : null;
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (!startDate) {
      startDate = todayOnly;
      await supabase
        .from("users")
        .update({ daily_quiz_start_date: todayOnly.toISOString().split("T")[0] })
        .eq("wallet_address", address);
    }
    const diffDays = Math.floor((todayOnly.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const { data: quizList } = await supabase
      .from("daily_quizzes")
      .select("*")
      .order("id", { ascending: true });
    const todayQuiz = quizList?.[Math.min(diffDays, quizList.length - 1)];
    if (!todayQuiz || !todayQuiz.question) return;
    setQuiz(todayQuiz);
  };

  const handleAnswer = async (option: string) => {
    if (!quiz || selectedAnswer) return;
    setSelectedAnswer(option);
    const correct = option === quiz.correct_answer;
    setIsCorrect(correct);
    const today = getKSTDateString();
    await supabase.from("daily_quests").upsert({
      wallet_address: address,
      date: today,
      type: "quiz",
      status: "completed",
    }, {
      onConflict: ['wallet_address', 'date', 'type']
    });
    setQuizDoneToday(true);
    await fetchDailyQuestStatus();
  };

  const fetchCheckinHistory = async () => {
    const today = getKSTDateString();
    const { data, error } = await supabase
      .from("daily_quests")
      .select("date")
      .eq("wallet_address", address)
      .eq("type", "checkin")
      .eq("status", "completed");
    if (error) {
      console.error("❌ 출석 데이터 조회 실패:", error);
      return;
    }
    const dates = data.map((item) => item.date);
    setCheckinHistory(dates);
    setCheckinDoneToday(dates.includes(today));
  };

  const handleCheckin = async () => {
    const today = getKSTDateString();
    if (checkinDoneToday) return;
    const { error } = await supabase.from("daily_quests").upsert({
      wallet_address: address,
      date: today,
      type: "checkin",
      status: "completed",
    }, {
      onConflict: ["wallet_address", "date", "type"]
    });
    if (error) {
      console.error("❌ 출석 저장 실패:", error);
      return;
    }
    setCheckinDoneToday(true);
    setCheckinHistory((prev) => [...prev, today]);
    await fetchDailyQuestStatus();
  };

  return (
    <main className="w-full min-h-screen bg-[#f5f7fa] pt-0 pb-20">
      <TopBar icon={<Home size={20} className="text-gray-700" />} title="홈" />
      <div className="max-w-[500px] mx-auto px-3 pt-2 space-y-2">
        {/* ✅ 광고 배너 */}
        <div className="w-full rounded-xl overflow-hidden shadow border bg-white">
          <img src="/ads/ad1.png" alt="광고" className="w-full h-24 object-cover" />
        </div>

        {/* ✅ 일일 퀘스트 바 */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 px-5 py-5">
          <h3 className="text-sm font-bold text-gray-800 mb-2">일일 퀘스트</h3>
          <div className="relative w-full bg-gray-200 h-5 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${questProgress}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-center">
            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {questProgress}% 달성
            </span>
          </div>
        </section>

        {/* ✅ 데일리 퀴즈 */}
        {quiz && (
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 px-5 py-5">
            <h3 className="text-sm text-blue-500 font-semibold">데일리 퀴즈</h3>
            <p className="text-md font-bold text-gray-800 mt-2">{quiz.question}</p>
            <div className="space-y-2 mt-4">
              {[quiz.option_1, quiz.option_2, quiz.option_3].map((option: string, idx: number) => {
                const isSelected = selectedAnswer === option;
                const isAnswer = quiz.correct_answer === option;
                let buttonClass = "bg-gray-100 text-gray-700 border border-gray-200";
                let icon = null;
                if (selectedAnswer) {
                  if (isAnswer) {
                    buttonClass = "bg-green-100 border-green-500 text-green-700";
                    icon = "✅";
                  } else if (isSelected && !isAnswer) {
                    buttonClass = "bg-red-100 border-red-500 text-red-700";
                    icon = "❌";
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer || quizDoneToday}
                    className={`w-full flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition ${buttonClass}`}
                  >
                    {option}
                    {icon && <span className="text-xl">{icon}</span>}
                  </button>
                );
              })}
            </div>
            {selectedAnswer && (
              <div className="mt-4 text-center text-sm font-medium">
                {isCorrect ? (
                  <span className="text-green-600">정답입니다! 🎉</span>
                ) : (
                  <span className="text-red-600">
                    오답입니다. 정답은 <strong className="text-green-600">{quiz.correct_answer}</strong> 입니다.
                  </span>
                )}
              </div>
            )}
          </section>
        )}

        {/* ✅ 출석체크 */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 px-5 py-6">
          <h3 className="text-sm font-semibold text-blue-600 mb-1">📅 출석체크</h3>
          <p className="text-sm text-gray-700 mb-4">10일 동안 매일 출석 체크하고 리워드 챙겨가세요!</p>
          <div className="grid grid-cols-5 gap-3 mb-4">
            {[...Array(10)].map((_, idx) => {
              const checked = idx < checkinHistory.length;
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center rounded-xl w-full aspect-square shadow-sm border
                    ${checked ? "bg-blue-100 border-blue-400" : "bg-gray-100 border-gray-200"}`}
                >
                  <div className={`text-2xl font-bold ${checked ? "text-blue-600" : "text-gray-400"}`}>
                    {checked ? "✔" : idx + 1}
                  </div>
                  <div className="text-[11px] text-gray-700 mt-1">{idx + 1}일차</div>
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
            <div className="text-center text-green-600 font-semibold">오늘 출석 완료!</div>
          )}
        </section>
      </div>
      <BottomNav />
    </main>
  );
}