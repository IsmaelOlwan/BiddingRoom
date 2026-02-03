import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Copy, ArrowRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function RoomReadyPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const roomUrl = `${window.location.origin}/room/${id}`;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Share this link with potential buyers.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

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
            <Input value={roomUrl} readOnly className="font-mono bg-muted/50" />
            <Button onClick={copyToClipboard} variant="outline" className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="pt-2">
             <Link href={`/room/${id}`}>
              <Button variant="secondary" className="w-full">
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
