"use client";

import { useRouter } from "next/navigation";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import ProfileEditPage from "@/app/()/profile/edit/page";

export default function ProfileEditModal() {
  const router = useRouter();

  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
      }}
    >
      <DialogContent
        className="
          sm:max-w-[40vw]
          max-h-[90vh]
          overflow-y-auto
          border-zinc-800
          bg-zinc-950
        "
      >
        <ProfileEditPage />
      </DialogContent>
    </Dialog>
  );
}
