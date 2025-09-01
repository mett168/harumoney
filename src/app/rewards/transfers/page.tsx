import { Suspense } from "react";
import TransfersClient from "./TransfersClient";

export const dynamic = "force-dynamic"; // 쿼리 파라미터 의존 → SSG 비활성화

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TransfersClient />
    </Suspense>
  );
}
