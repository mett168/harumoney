'use client';

import { useRouter } from 'next/navigation';

export default function FuturesStep1() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#e7eff5] p-4 space-y-6">
      {/* 상단 제목 및 뒤로가기 */}
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => router.back()} className="text-gray-500 text-xl">←</button>
        <h1 className="text-xl font-bold">선물거래란?</h1>
      </div>

      {/* 🔖 개념 설명 */}
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-2">
        <p className="font-semibold text-red-600">📌 선물거래란 무엇인가요?</p>
        <p className="text-sm text-gray-700">
          선물거래는 ‘나중에 정해진 시점에, 정해진 가격으로 사고팔기로 약속하는 거래’입니다.
        </p>
        <p className="text-sm text-gray-700">
          조금 더 쉽게 말씀드리면,<br />
          지금 당장은 물건이나 자산을 주고받지 않지만,<br />
          미래의 특정한 날에, 미리 정해둔 가격으로 거래를 하기로 약속하는 것이에요.
        </p>
      </div>

      {/* 🎯 예시 설명 */}
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-2">
        <p className="font-semibold text-pink-600">🎯 예시로 이해해보세요</p>
        <p className="text-sm font-semibold">🍎 사과 선물거래 이야기</p>
        <p className="text-sm text-gray-700">
          A 씨는 과수원 주인입니다.<br />
          올해 가을에는 사과 가격이 비쌀 것 같다고 생각했어요.<br />
          B 씨는 마트 운영자입니다.<br />
          가을에 사과 가격이 너무 오를까 봐 걱정이 되었죠.<br />
          그래서 두 사람은 이렇게 약속을 합니다.<br /><br />
          “3개월 뒤에 사과 1박스를 2만 원에 사고팝시다!”<br /><br />
          그 후 시간이 흘러…<br /><br />
          가을이 되어 사과 1박스 가격이 2만5천 원이 되었다면?<br />
          👉 B 씨는 원래 약속된 2만 원에 사서 싸게 산 셈이니 이익입니다.<br /><br />
          반대로 사과 가격이 1만5천 원이었다면?<br />
          B 씨는 손해를 보게 되겠죠.
        </p>
      </div>
    </div>
  );
}
