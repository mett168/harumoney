import { NextResponse } from "next/server";

const CLIENT_ID = process.env.NAVER_CLIENT_ID!;
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET!;

export async function GET() {
  const query = encodeURIComponent("비트코인 OR 암호화폐 OR 크립토");
  const url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=3&sort=date`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": CLIENT_ID,
      "X-Naver-Client-Secret": CLIENT_SECRET,
    },
  });

  if (!res.ok) return NextResponse.json({ error: "뉴스 요청 실패" }, { status: 500 });

  const data = await res.json();
  return NextResponse.json(data.items);
}

