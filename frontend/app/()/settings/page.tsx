import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Settings</h1>

        <p className="mt-2 text-muted-foreground">
          Manage your channel, profile and preferences.
        </p>
      </div>

      <div className="space-y-8">
        {/* Channel */}
        <Card className="border-zinc-800 bg-zinc-950/40">
          <CardContent className="space-y-8 p-6">
            <div>
              <h2 className="text-lg font-semibold">Channel Customization</h2>

              <p className="text-sm text-muted-foreground">
                Update your public channel information.
              </p>
            </div>

            <Separator />

            {/* Banner */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                Channel Banner
              </label>

              <div className="flex h-64 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 transition hover:border-violet-500">
                <div className="text-center">
                  <p className="font-medium">Upload Banner</p>

                  <p className="text-sm text-muted-foreground">
                    Recommended 2048 × 1152
                  </p>
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-6">
              <Avatar className="h-28 w-28">
                <AvatarFallback className="bg-zinc-800 text-xl">
                  HP
                </AvatarFallback>
              </Avatar>

              <div>
                <Button variant="outline">Change Logo</Button>

                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG up to 5 MB
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Channel Name
              </label>

              <Input placeholder="My Awesome Channel" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Handle</label>

              <Input placeholder="@mychannel" />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-zinc-800 bg-zinc-950/40">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-lg font-semibold">About</h2>

              <p className="text-sm text-muted-foreground">
                Information viewers can see about your channel.
              </p>
            </div>

            <Separator />

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <Textarea
                rows={6}
                placeholder="Tell viewers about your channel..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Website</label>

              <Input placeholder="https://yourwebsite.com" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Location</label>

              <Input placeholder="India" />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-zinc-800 bg-zinc-950/40">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-lg font-semibold">Preferences</h2>

              <p className="text-sm text-muted-foreground">
                Personal application settings.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>

                <p className="text-sm text-muted-foreground">
                  Receive updates by email
                </p>
              </div>

              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>

                <p className="text-sm text-muted-foreground">
                  Use dark appearance
                </p>
              </div>

              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-10">
          <Button size="lg">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
