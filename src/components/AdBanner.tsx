'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

const ads = ["/ads/ad1.png", "/ads/ad2.png"];

export default function AdBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, 4000); // 4초마다 전환
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 mb-2">
      <Image
        src={ads[index]}
        alt={`광고 배너 ${index + 1}`}
        width={500}
        height={100}
        className="w-full rounded-lg object-cover"
      />
    </div>
  );
}
