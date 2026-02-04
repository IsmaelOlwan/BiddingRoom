import { Link, useParams, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Copy, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function RoomReadyPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get("session_id");
  
  const roomUrl = `${window.location.origin}/room/${id}`;
  const [copied, setCopied] = useState(false);

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
    // Poll every 2 seconds until payment is confirmed via webhook
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.paid) return false; // Stop polling once paid
      return 2000; // Poll every 2 seconds
    },
    retry: 3,
    retryDelay: 1000,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Share this link with potential buyers.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying payment...</p>
      </div>
    );
  }

  // Show error state only for actual errors, not pending state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Payment Error</h1>
        <p className="text-muted-foreground mb-6">
          {error?.message || "Something went wrong. Please try again."}
        </p>
        <Link href="/create">
          <Button>Try Again</Button>
        </Link>
      </div>
    );
  }

  // Show processing state while waiting for webhook confirmation
  if (!data?.paid) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-display font-bold mb-2">Processing Payment...</h1>
        <p className="text-muted-foreground">
          Please wait while we confirm your payment. This usually takes a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="mb-8 animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-2">Your room is ready</h1>
        <p className="text-muted-foreground text-lg">You can now invite buyers to bid on your asset.</p>
      </div>

      <Card className="w-full max-w-lg border-border shadow-lg mb-8 text-left">
        <CardHeader>
          <CardTitle>Share with buyers</CardTitle>
          <CardDescription>
            Anyone with this link can view the asset and place bids.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={roomUrl} 
              readOnly 
              className="font-mono bg-muted/50" 
              data-testid="input-room-url"
            />
            <Button 
              onClick={copyToClipboard} 
              variant="outline" 
              className="shrink-0"
              data-testid="button-copy-url"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="pt-2">
             <Link href={`/room/${id}`}>
              <Button variant="secondary" className="w-full" data-testid="button-go-to-room">
                Go to room <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>No account required</span>
        <span>•</span>
        <span>Link active until deadline</span>
      </div>
    </div>
  );
}
