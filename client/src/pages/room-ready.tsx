import { Link, useParams, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Copy, ExternalLink, Loader2, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function RoomReadyPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get("session_id");
  
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["room-verify", id, sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${id}/verify-payment?session_id=${sessionId || ""}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to verify payment");
      }
      return res.json();
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.paid) return false;
      return 2000;
    },
  });

  const roomUrl = `${window.location.origin}/room/${id}`;
  const ownerUrl = data?.room?.ownerToken ? `${window.location.origin}/room/owner/${data.room.ownerToken}` : "";

  const copyPublic = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedPublic(true);
    toast({ title: "Link copied", description: "Share this link with potential buyers." });
    setTimeout(() => setCopiedPublic(false), 2000);
  };

  const copyOwner = () => {
    if (!ownerUrl) return;
    navigator.clipboard.writeText(ownerUrl);
    setCopiedOwner(true);
    toast({ title: "Owner link copied", description: "Keep this link secret! Use it to manage your room." });
    setTimeout(() => setCopiedOwner(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Payment Error</h1>
        <p className="text-muted-foreground mb-6">{error?.message}</p>
        <Link href="/create">
          <Button>Try Again</Button>
        </Link>
      </div>
    );
  }

  if (!data?.paid) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-display font-bold mb-2">Processing Payment...</h1>
        <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="mb-8 animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-2">Your room is ready</h1>
        <p className="text-muted-foreground text-lg">You can now invite buyers to bid on your asset.</p>
      </div>

      <Card className="w-full max-w-lg border-border shadow-lg mb-8 text-left">
        <CardHeader>
          <CardTitle>Room Access</CardTitle>
          <CardDescription>Save these links. We don't use accounts, so these URLs are the only way to access your room.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Public Bidding Link (Share with buyers)</label>
            <div className="flex gap-2">
              <Input value={roomUrl} readOnly className="font-mono bg-muted/50 text-xs" />
              <Button onClick={copyPublic} variant="outline" size="icon" className="shrink-0">
                {copiedPublic ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-destructive">Private Owner Link (Keep this secret!)</label>
            <div className="flex gap-2">
              <Input value={ownerUrl} readOnly className="font-mono bg-destructive/5 border-destructive/20 text-xs" />
              <Button onClick={copyOwner} variant="outline" size="icon" className="shrink-0 hover:bg-destructive/10">
                {copiedOwner ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">Use this link to see bidder emails and accept the best offer. Do not share this with buyers.</p>
          </div>

          <div className="pt-2 flex gap-3">
             <Link href={`/room/${id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Public Room <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
             <Link href={`/room/owner/${data.room.ownerToken}`} className="flex-1">
              <Button className="w-full font-bold">
                Manage Room <ShieldCheck className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
