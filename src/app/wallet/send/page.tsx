'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveAccount } from 'thirdweb/react';

import TopBar from '@/components/TopBar';

export default function SendPage() {
  const account = useActiveAccount();
  const router = useRouter();
  const [amount, setAmount] = useState('');

  const handleKey = (key: string) => {
    if (key === '←') {
      setAmount((prev) => prev.slice(0, -1));
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←'];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between pb-6">
      <TopBar />

      <div className="flex flex-col items-center mt-6">
        <p className="text-4xl font-bold text-gray-800">
          {amount || '0'} <span className="text-gray-500">USDT</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 px-8 py-6">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className="text-2xl font-medium text-gray-700 py-3"
          >
            {k}
          </button>
        ))}
      </div>

      <button
        className="mx-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-full text-lg font-semibold"
        onClick={() => router.push('/wallet/recipient')}
      >
        다음
      </button>
    </div>
  );
}
