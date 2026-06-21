"use client";

import { Camera, Globe, Mail, MapPin, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ProfileEditPage() {
  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Manage your personal information and public profile.
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="flex flex-col gap-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-28 w-28 border border-zinc-700">
                  <AvatarFallback className="bg-violet-600 text-3xl font-semibold">
                    HP
                  </AvatarFallback>
                </Avatar>

                <Button
                  size="icon"
                  className="
                    absolute
                    -bottom-1
                    -right-1
                    h-9
                    w-9
                    rounded-full
                    bg-violet-600
                    hover:bg-violet-500
                  "
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <h2 className="text-xl font-semibold">Hari Prasath</h2>

                <p className="text-sm text-zinc-400">@hari</p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-zinc-700"
                >
                  Upload New Photo
                </Button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Display Name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />

                  <Input
                    placeholder="Hari Prasath"
                    className="
                      h-11
                      border-zinc-800
                      bg-zinc-900/50
                      pl-10
                    "
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Username
                </label>

                <Input
                  placeholder="@hari"
                  className="
                    h-11
                    border-zinc-800
                    bg-zinc-900/50
                  "
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-zinc-400">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />

                  <Input
                    placeholder="hari@example.com"
                    className="
                      h-11
                      border-zinc-800
                      bg-zinc-900/50
                      pl-10
                    "
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Bio</label>

              <Textarea
                rows={5}
                placeholder="Backend engineer, creator and technology enthusiast."
                className="
                  resize-none
                  border-zinc-800
                  bg-zinc-900/50
                "
              />
            </div>

            {/* Extra Details */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Location
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />

                  <Input
                    placeholder="Mumbai, India"
                    className="
                      h-11
                      border-zinc-800
                      bg-zinc-900/50
                      pl-10
                    "
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Website
                </label>

                <div className="relative">
                  <Globe className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />

                  <Input
                    placeholder="https://yourwebsite.com"
                    className="
                      h-11
                      border-zinc-800
                      bg-zinc-900/50
                      pl-10
                    "
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 border-t border-zinc-800 pt-6">
              <Button variant="outline" className="border-zinc-700">
                Cancel
              </Button>

              <Button className="bg-violet-600 hover:bg-violet-500">
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
