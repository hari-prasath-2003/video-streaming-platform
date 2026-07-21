"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import UseAuth from "@/hooks/UseAuth";
import useUserStore from "@/store/User";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Image from "next/image";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const accessToken = useUserStore((state) => state.accessToken);
  const { refreshAccessToken } = UseAuth();

  const refreshTokenQuery = useQuery<string | null, AxiosError>({
    queryKey: ["refreshToken"],
    queryFn: refreshAccessToken,
    gcTime: 0,
    enabled: !accessToken,
  });

  useEffect(() => {
    if (refreshTokenQuery.isError) {
      const error = refreshTokenQuery.error as AxiosError;

      if (error.response?.status === 401) {
        const currentUrl = window.location.pathname + window.location.search;

        router.replace(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      }
    }
  }, [refreshTokenQuery.isError, refreshTokenQuery.error, router]);

  if (refreshTokenQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (refreshTokenQuery.error?.response?.status === 401) {
    return null;
  }

  if (refreshTokenQuery.error?.response?.status === 500) {
    return (
      <div className="relative h-screen w-screen">
        <Image
          src="/image.png"
          alt="Internal server error"
          fill
          priority
          className="object-contain"
        />
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
