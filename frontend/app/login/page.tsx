"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import UseAuth from "@/hooks/UseAuth";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = UseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleLogin() {
    try {
      await login(email, password);
      const redirect = searchParams.get("redirect");
      router.replace(redirect || "/");
    } catch (error) {}
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Side */}

        <div className="hidden lg:flex flex-col justify-between border-r border-zinc-800 bg-zinc-950 p-12">
          <div>
            <h1 className="text-3xl font-bold">VidForge</h1>
          </div>

          <div>
            <h2 className="max-w-lg text-5xl font-bold leading-tight">
              Stream, share and discover content at scale.
            </h2>

            <p className="mt-6 text-lg text-zinc-400">
              A modern streaming platform built for creators and viewers.
            </p>
          </div>

          <div className="text-sm text-zinc-500">© 2026 VidForge</div>
        </div>

        {/* Right Side */}

        <div className="flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div>
              <h1 className="text-4xl font-bold">Welcome back</h1>

              <p className="mt-2 text-zinc-400">Login to your account</p>
            </div>

            <div className="mt-8 space-y-5">
              <Input
                placeholder="Email"
                className="h-12 border-zinc-700 bg-zinc-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-zinc-700 bg-zinc-900"
              />

              <Button className="h-12 w-full" onClick={handleLogin}>
                Sign In
              </Button>
            </div>

            <p className="mt-8 text-center text-sm text-zinc-400">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-white">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
