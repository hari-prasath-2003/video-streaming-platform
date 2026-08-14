"use client";

import { useState, type FormEvent } from "react";
import { Bell, Menu, Search, Upload } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { UploadDialog } from "@/components/upload-dialog";
import { useRouter } from "next/navigation";
import UseAccount from "@/hooks/UseAccount";
import UseApi from "@/hooks/UseApi";
import { initialsOf } from "@/lib/user";
import { mediaUrl } from "@/lib/video";

export function Navbar() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { account } = UseAccount();
  const { accessToken } = UseApi();

  const avatarSrc = mediaUrl(account?.profile?.avatarUrl ?? null, accessToken);

  function submitSearch(event: FormEvent) {
    event.preventDefault();

    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="flex h-20 items-center justify-between px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Menu className="h-6 w-6 cursor-pointer text-zinc-300" />

            <h1 className="text-2xl font-bold tracking-tight text-white">
              VidForge
            </h1>
          </div>

          {/* Search */}
          <form
            onSubmit={submitSearch}
            className="hidden w-full max-w-2xl px-8 md:flex"
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search videos and channels..."
                className="
                  h-12
                  rounded-full
                  border-zinc-700
                  bg-zinc-900
                  pl-12
                  text-base
                  text-white
                  placeholder:text-zinc-500
                  focus-visible:ring-1
                  focus-visible:ring-zinc-500
                "
              />
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setUploadOpen(true)}
              variant="outline"
              className="
                border-zinc-700
                bg-zinc-900
                text-white
                hover:bg-zinc-800
              "
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>

            <Bell
              className="h-5 w-5 cursor-pointer text-zinc-300"
              onClick={() => router.push("/notification")}
            />

            <Avatar
              className="h-10 w-10 cursor-pointer"
              onClick={() => router.push("/profile/edit")}
            >
              {avatarSrc && <AvatarImage src={avatarSrc} alt="Your profile" />}

              <AvatarFallback className="bg-zinc-800 text-white">
                {initialsOf(account?.profile?.displayName ?? account?.email)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
