'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient, getContract } from 'thirdweb';
import { polygon } from 'thirdweb/chains';

import TopBar from '@/components/TopBar';

const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';

export default function SendPage() {
  const account = useActiveAccount();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [usdtBalance, setUsdtBalance] = useState('0.000');

  useEffect(() => {
    const fetchUSDTBalance = async () => {
      if (!account?.address) return;

      try {
        const client = createThirdwebClient({
          clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
        });

        const contract = getContract(USDT_ADDRESS, polygon, client);
        const balance = await contract.erc20.balanceOf(account.address);
        setUsdtBalance(balance.displayValue);
      } catch (err) {
        console.error('❌ USDT 잔액 불러오기 실패:', err);
        setUsdtBalance('0.000');
      }
    };

    fetchUSDTBalance();
  }, [account]);

  const handleKey = (key: string) => {
    if (key === '←') {
      setAmount((prev) => prev.slice(0, -1));
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const handleMax = () => {
    setAmount(usdtBalance);
  };

  const keys = ['1','2','3','4','5','6','7','8','9','.','0','←'];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between pb-6">
      <TopBar title="보내기" showBack />

      <div className="flex flex-col items-center mt-6">
        <p className="text-4xl font-bold text-gray-800">{amount || '0'} <span className="text-gray-500">USDT</span></p>
        <p className="text-sm text-gray-400 mt-2">잔액 {usdtBalance} USDT</p>
        <button onClick={handleMax} className="mt-2 bg-blue-100 text-blue-700 px-5 py-1.5 rounded-full text-sm font-semibold">MAX</button>
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
  className="mx-6 bg-gradient-to-r from-cyan-200 to-blue-200 text-white py-3 rounded-full text-lg font-semibold"
  onClick={() => router.push('/wallet/recipient')}
>
  다음
</button>

    </div>
  );
}
