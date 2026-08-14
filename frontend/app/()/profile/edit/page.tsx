"use client";

import { useEffect, useRef, useState } from "react";
import { AtSign, Camera, KeyRound, Mail, Trash2, Tv, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import UseApi from "@/hooks/UseApi";
import UseAccount from "@/hooks/UseAccount";
import { initialsOf } from "@/lib/user";
import { mediaUrl } from "@/lib/video";

/** Turn an axios error into the message the API actually sent, if any. */
function apiMessage(error: unknown, fallback: string) {
  const response = (error as { response?: { data?: { message?: string } } })
    .response;

  return response?.data?.message ?? fallback;
}

export default function ProfileEditPage() {
  const { account, loading, saveAccount, uploadImage, removeImage, setAccount } =
    UseAccount();
  const { patch, accessToken } = UseApi();

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    channelName: "",
    channelHandle: "",
    channelDescription: "",
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);

  // Credential changes go to auth-service, not user-service.
  const [credentials, setCredentials] = useState({
    currentPassword: "",
    newEmail: "",
    newPassword: "",
  });
  const [credentialStatus, setCredentialStatus] = useState<string | null>(null);
  const [credentialError, setCredentialError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;

    setForm({
      displayName: account.profile?.displayName ?? "",
      username: account.profile?.username ?? "",
      bio: account.profile?.bio ?? "",
      channelName: account.channel?.name ?? "",
      channelHandle: account.channel?.handle ?? "",
      channelDescription: account.channel?.description ?? "",
    });
  }, [account]);

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (event: { target: { value: string } }) =>
        setForm((current) => ({ ...current, [key]: event.target.value })),
    };
  }

  /** Only send fields the user actually changed, so unique checks don't fire needlessly. */
  function changedProfile() {
    const profile: Record<string, unknown> = {};

    if (form.displayName !== (account?.profile?.displayName ?? ""))
      profile.displayName = form.displayName;

    if (form.username !== (account?.profile?.username ?? ""))
      profile.username = form.username;

    if (form.bio !== (account?.profile?.bio ?? ""))
      profile.bio = form.bio.trim() === "" ? null : form.bio;

    return profile;
  }

  function changedChannel() {
    const channel: Record<string, unknown> = {};

    if (form.channelName !== (account?.channel?.name ?? ""))
      channel.name = form.channelName;

    if (form.channelHandle !== (account?.channel?.handle ?? ""))
      channel.handle = form.channelHandle;

    if (form.channelDescription !== (account?.channel?.description ?? ""))
      channel.description =
        form.channelDescription.trim() === "" ? null : form.channelDescription;

    return channel;
  }

  async function save() {
    const profile = changedProfile();
    const channel = changedChannel();

    if (Object.keys(profile).length === 0 && Object.keys(channel).length === 0) {
      setStatus("Nothing to save.");
      return;
    }

    setSaving(true);
    setStatus(null);
    setError(null);

    try {
      await saveAccount({
        ...(Object.keys(profile).length > 0 ? { profile } : {}),
        ...(Object.keys(channel).length > 0 ? { channel } : {}),
      });

      setStatus("Saved.");
    } catch (saveError) {
      setError(apiMessage(saveError, "Could not save your changes."));
    } finally {
      setSaving(false);
    }
  }

  async function changeEmail() {
    setCredentialStatus(null);
    setCredentialError(null);

    try {
      const res = await patch("/api/account/me/email", {
        currentPassword: credentials.currentPassword,
        newEmail: credentials.newEmail,
      });

      if (account) {
        setAccount({ ...account, email: res.data.email });
      }

      setCredentials((current) => ({
        ...current,
        newEmail: "",
        currentPassword: "",
      }));
      setCredentialStatus("Email updated.");
    } catch (emailError) {
      setCredentialError(apiMessage(emailError, "Could not update your email."));
    }
  }

  async function changePassword() {
    setCredentialStatus(null);
    setCredentialError(null);

    try {
      await patch("/api/account/me/password", {
        currentPassword: credentials.currentPassword,
        newPassword: credentials.newPassword,
      });

      setCredentials({
        currentPassword: "",
        newEmail: "",
        newPassword: "",
      });
      setCredentialStatus("Password updated.");
    } catch (passwordError) {
      setCredentialError(
        apiMessage(passwordError, "Could not update your password."),
      );
    }
  }

  async function pickImage(kind: "avatar" | "banner", file: File | undefined) {
    if (!file) return;

    setUploading(kind);
    setStatus(null);
    setError(null);

    try {
      await uploadImage(kind, file);
      setStatus(`${kind === "avatar" ? "Profile picture" : "Banner"} updated.`);
    } catch (uploadError) {
      setError(apiMessage(uploadError, `Could not upload your ${kind}.`));
    } finally {
      setUploading(null);
    }
  }

  async function clearImage(kind: "avatar" | "banner") {
    setStatus(null);
    setError(null);

    try {
      await removeImage(kind);
      setStatus(`${kind === "avatar" ? "Profile picture" : "Banner"} removed.`);
    } catch (removeError) {
      setError(apiMessage(removeError, `Could not remove your ${kind}.`));
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl p-6 text-sm text-zinc-400">
        Loading your account…
      </div>
    );
  }

  const inputClass = "h-11 border-zinc-800 bg-zinc-900/50";
  const avatarSrc = mediaUrl(account?.profile?.avatarUrl ?? null, accessToken);
  const bannerSrc = mediaUrl(account?.profile?.bannerUrl ?? null, accessToken);

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Manage your profile, your channel and your sign-in details.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="flex flex-col gap-8">
            {/* Identity */}
            <div>
              {/* Banner */}
              <div className="relative mb-6 h-40 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
                {bannerSrc && (
                  <img
                    src={bannerSrc}
                    alt="Channel banner"
                    className="h-full w-full object-cover"
                  />
                )}

                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button
                    size="sm"
                    disabled={uploading !== null}
                    onClick={() => bannerInput.current?.click()}
                    className="bg-black/70 hover:bg-black/90"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {uploading === "banner" ? "Uploading…" : "Change banner"}
                  </Button>

                  {account?.profile?.bannerUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 bg-black/70"
                      onClick={() => clearImage("banner")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-28 w-28 border border-zinc-700">
                    {avatarSrc && (
                      <AvatarImage src={avatarSrc} alt={form.displayName} />
                    )}

                    <AvatarFallback className="bg-violet-600 text-3xl font-semibold">
                      {initialsOf(form.displayName || account?.email)}
                    </AvatarFallback>
                  </Avatar>

                  <Button
                    size="icon"
                    disabled={uploading !== null}
                    onClick={() => avatarInput.current?.click()}
                    className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-violet-600 hover:bg-violet-500"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <h2 className="text-xl font-semibold">
                    {form.displayName || "Unnamed"}
                  </h2>

                  <p className="text-sm text-zinc-400">@{form.username}</p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {account?.subscriberCount ?? 0} subscribers ·{" "}
                    {account?.subscriptionCount ?? 0} subscriptions
                  </p>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploading !== null}
                      className="border-zinc-700"
                      onClick={() => avatarInput.current?.click()}
                    >
                      {uploading === "avatar"
                        ? "Uploading…"
                        : "Upload new photo"}
                    </Button>

                    {account?.profile?.avatarUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400"
                        onClick={() => clearImage("avatar")}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-zinc-500">
                    PNG, JPG or WebP, up to 5MB. Your picture is used on your
                    channel, comments and search results.
                  </p>
                </div>
              </div>

              {/* The pickers are driven by the buttons above. */}
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  pickImage("avatar", event.target.files?.[0]);
                  event.target.value = "";
                }}
              />

              <input
                ref={bannerInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  pickImage("banner", event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </div>

            {/* Profile */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Display Name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />

                  <Input
                    {...field("displayName")}
                    placeholder="Your name"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Username
                </label>

                <div className="relative">
                  <AtSign className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />

                  <Input
                    {...field("username")}
                    placeholder="username"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Bio</label>

              <Textarea
                {...field("bio")}
                rows={4}
                placeholder="Tell people about yourself."
                className="resize-none border-zinc-800 bg-zinc-900/50"
              />
            </div>

            {/* Channel */}
            <div className="border-t border-zinc-800 pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Tv className="h-4 w-4 text-violet-400" />
                Channel
              </h3>

              {account?.channel ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-zinc-400">
                      Channel name
                    </label>

                    <Input
                      {...field("channelName")}
                      className={inputClass}
                      placeholder="Channel name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-zinc-400">
                      Handle
                    </label>

                    <Input
                      {...field("channelHandle")}
                      className={inputClass}
                      placeholder="handle"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-zinc-400">
                      Description
                    </label>

                    <Textarea
                      {...field("channelDescription")}
                      rows={3}
                      placeholder="What is your channel about?"
                      className="resize-none border-zinc-800 bg-zinc-900/50"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  You do not have a channel yet.
                </p>
              )}
            </div>

            {status && <p className="text-sm text-emerald-400">{status}</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex justify-end gap-3 border-t border-zinc-800 pt-6">
              <Button
                variant="outline"
                className="border-zinc-700"
                onClick={() => account && setAccount({ ...account })}
              >
                Reset
              </Button>

              <Button
                disabled={saving}
                onClick={save}
                className="bg-violet-600 hover:bg-violet-500"
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign-in details — auth-service, guarded by the current password */}
      <Card className="mt-6 border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
        <CardContent className="p-8">
          <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold">
            <KeyRound className="h-4 w-4 text-violet-400" />
            Sign-in details
          </h3>

          <p className="mb-6 text-sm text-zinc-400">
            Signed in as {account?.email}. Changing either of these requires
            your current password.
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-zinc-400">
                Current password
              </label>

              <Input
                type="password"
                value={credentials.currentPassword}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                New email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />

                <Input
                  value={credentials.newEmail}
                  onChange={(event) =>
                    setCredentials((current) => ({
                      ...current,
                      newEmail: event.target.value,
                    }))
                  }
                  placeholder="you@example.com"
                  className={`${inputClass} pl-10`}
                />
              </div>

              <Button
                variant="outline"
                className="mt-3 border-zinc-700"
                disabled={!credentials.currentPassword || !credentials.newEmail}
                onClick={changeEmail}
              >
                Update email
              </Button>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                New password
              </label>

              <Input
                type="password"
                value={credentials.newPassword}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                placeholder="At least 8 characters"
                className={inputClass}
              />

              <Button
                variant="outline"
                className="mt-3 border-zinc-700"
                disabled={
                  !credentials.currentPassword || !credentials.newPassword
                }
                onClick={changePassword}
              >
                Update password
              </Button>
            </div>
          </div>

          {credentialStatus && (
            <p className="mt-4 text-sm text-emerald-400">{credentialStatus}</p>
          )}

          {credentialError && (
            <p className="mt-4 text-sm text-red-400">{credentialError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
