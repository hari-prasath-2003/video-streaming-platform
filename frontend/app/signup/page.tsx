"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import UseAuth from "@/hooks/UseAuth";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { signup } = UseAuth();

  async function handleSignup() {
    try {
      await signup(email, password, fullName);
      const redirect = searchParams.get("redirect");
      router.replace(redirect || "/");
    } catch (error) {}
  }
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between border-r border-zinc-800 bg-zinc-950 p-12">
          <div>
            <h1 className="text-3xl font-bold">VidForge</h1>
          </div>

          <div>
            <h2 className="max-w-lg text-5xl font-bold leading-tight">
              Build your audience and publish videos globally.
            </h2>

            <p className="mt-6 text-lg text-zinc-400">
              Join creators sharing content with millions.
            </p>
          </div>

          <div className="text-sm text-zinc-500">© 2026 VidForge</div>
        </div>

        <div className="flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div>
              <h1 className="text-4xl font-bold">Create Account</h1>

              <p className="mt-2 text-zinc-400">Start your journey today</p>
            </div>

            <div className="mt-8 space-y-5">
              <Input
                type="text"
                autoComplete="name"
                placeholder="Full Name"
                className="h-12 border-zinc-700 bg-zinc-900"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <Input
                placeholder="Email"
                autoComplete="email"
                type="email"
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

              <Button className="h-12 w-full" onClick={handleSignup}>
                Create Account
              </Button>
            </div>

            <p className="mt-8 text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-white">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
