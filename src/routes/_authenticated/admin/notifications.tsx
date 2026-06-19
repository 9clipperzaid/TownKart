import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { adminSendNotification, adminListUsers } from "@/lib/admin.functions";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: NotificationsPage,
});

type UserRow = { id: string; full_name: string | null; phone: string | null };

function NotificationsPage() {
  const qc = useQueryClient();
  const send = useServerFn(adminSendNotification);
  const listUsers = useServerFn(adminListUsers);

  const [audience, setAudience] = useState<"all" | "user">("all");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listUsers() as Promise<UserRow[]>,
  });

  const sendMut = useMutation({
    mutationFn: () =>
      send({
        data: {
          audience,
          userId: audience === "user" ? userId : undefined,
          title,
          body: body || undefined,
          type: audience === "all" ? "announcement" : "info",
        },
      }),
    onSuccess: () => {
      toast.success("Notification sent");
      setTitle("");
      setBody("");
      qc.invalidateQueries({ queryKey: ["my-notifications"] });
    },
    onError: (e: Error) => toast.error(userErrorMessage(e)),
  });

  const canSend = title.trim() && (audience === "all" || userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Send announcements or message a specific user.
        </p>
      </div>

      <div className="max-w-2xl space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Audience</Label>
            <Select
              value={audience}
              onValueChange={(v) => setAudience(v as typeof audience)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone (broadcast)</SelectItem>
                <SelectItem value="user">Specific user</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {audience === "user" && (
            <div className="space-y-1.5">
              <Label>Recipient</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name || (u.phone ? `+${u.phone}` : u.id.slice(0, 8))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Big weekend sale!"
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Message</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Up to 30% off groceries this weekend."
          />
        </div>

        <Button disabled={!canSend || sendMut.isPending} onClick={() => sendMut.mutate()}>
          {audience === "all" ? (
            <Megaphone className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {sendMut.isPending ? "Sending…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
