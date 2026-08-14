"use client";

import { useEffect, useState } from "react";

import UseApi from "./UseApi";
import useUserStore from "@/store/User";
import type { Account } from "@/lib/user";

/**
 * Loads the signed-in user's account (profile + channel) and caches it in the
 * store so the navbar, watch page and account editor share one copy.
 *
 * Signup only creates auth-service credentials, so the first load of a new
 * account has no profile — this bootstraps one instead of leaving the user in
 * a half-registered state.
 */
export default function UseAccount() {
  const { get, post, patch, del } = UseApi();

  const accessToken = useUserStore((state) => state.accessToken);
  const account = useUserStore((state) => state.account);
  const setAccount = useUserStore((state) => state.setAccount);

  const [loading, setLoading] = useState(account === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || account) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        const res = await get("/api/user/me");
        let data = res.data as Account;

        if (!data.onboarded) {
          data = (await post("/api/user/me/bootstrap", {})).data as Account;
        }

        if (!cancelled) setAccount(data);
      } catch {
        if (!cancelled) setError("Could not load your account.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, account]);

  /** PATCH /api/user/me — profile and channel in one save. */
  async function saveAccount(payload: {
    profile?: Record<string, unknown>;
    channel?: Record<string, unknown>;
  }) {
    const res = await patch("/api/user/me", payload);
    setAccount(res.data as Account);
    return res.data as Account;
  }

  /**
   * Upload an avatar or banner. The server mirrors it onto the channel too,
   * and returns the refreshed account, so one call updates every screen.
   */
  async function uploadImage(kind: "avatar" | "banner", file: File) {
    const body = new FormData();
    body.append(kind, file);

    // Let the browser set the multipart boundary itself.
    const res = await post(`/api/user/me/${kind}`, body, {
      headers: { "Content-Type": undefined },
    });

    setAccount(res.data as Account);
    return res.data as Account;
  }

  async function removeImage(kind: "avatar" | "banner") {
    const res = await del(`/api/user/me/${kind}`);
    setAccount(res.data as Account);
    return res.data as Account;
  }

  return {
    account,
    loading,
    error,
    saveAccount,
    uploadImage,
    removeImage,
    setAccount,
  };
}
