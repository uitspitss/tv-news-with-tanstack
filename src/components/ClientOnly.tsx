/**
 * ClientOnlyコンポーネント
 * SSR hydration errorを回避するため、クライアントサイドでのみ子要素をレンダリング
 */

import { type ReactNode, useEffect, useState } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
