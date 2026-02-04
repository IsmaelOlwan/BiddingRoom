import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  Trophy, 
  Mail, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface Bid {
  id: string;
  amount: number;
  bidderEmail: string;
  createdAt: string;
}

interface OwnerRoomData {
  room: {
    id: string;
    title: string;
    description: string;
    deadline: string;
    sellerEmail: string;
    planType: string;
    winningBidId: string | null;
  };
  bids: Bid[];
  highestBid: number;
  totalBids: number;
}

export default function OwnerViewPage() {
  const { token } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<OwnerRoomData>({
    queryKey: ["room-owner", token],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/owner/${token}`);
      if (!res.ok) {
        throw new Error("Failed to load your bidding room. Make sure the link is correct.");
      }
      return res.json();
    },
    refetchInterval: 10000,
  });

  const closeAuctionMutation = useMutation({
    mutationFn: async (bidId: string) => {
      const res = await apiRequest("POST", `/api/rooms/${data?.room.id}/close`, {
        token,
        bidId
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-owner", token] });
      toast({
        title: "Auction Closed",
        description: "The best offer has been accepted and the room is now closed.",
      });
      setIsClosing(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to close auction",
        variant: "destructive",
      });
      setIsClosing(null);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          {error instanceof Error ? error.message : "We couldn't find this bidding room. Private owner links are unique and sensitive."}
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-8">Return Home</Button>
        </Link>
      </div>
    );
  }

  const { room, bids, highestBid, totalBids } = data;
  const isClosed = !!room.winningBidId;
  const winningBid = bids.find(b => b.id === room.winningBidId);

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="md:flex">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="font-display font-bold text-lg hidden md:block">Seller Admin Panel</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-3 w-3" />
              Private View
            </div>
            {isClosed && (
              <div className="flex items-center gap-2 font-mono text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Auction Closed
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-widest font-bold">
                Bidding Room: {room.id.slice(0, 8)}...
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                {room.title}
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                This is your private administrative view. Use this page to track bids and finalize the sale by accepting the best offer.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-[10px] uppercase font-bold tracking-tighter">Highest Bid</CardDescription>
                  <CardTitle className="text-2xl font-display">${highestBid.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-[10px] uppercase font-bold tracking-tighter">Total Bids</CardDescription>
                  <CardTitle className="text-2xl font-display">{totalBids}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-[10px] uppercase font-bold tracking-tighter">Status</CardDescription>
                  <CardTitle className="text-2xl font-display">{isClosed ? "Finalized" : "Active"}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Bidder Activity</CardTitle>
                    <CardDescription>Full transparency of all incoming offers</CardDescription>
                  </div>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {bids.length === 0 ? (
                  <div className="py-20 text-center">
                    <Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Waiting for the first bid...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {bids.map((bid) => {
                      const isWinner = room.winningBidId === bid.id;
                      return (
                        <div key={bid.id} className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${isWinner ? 'bg-green-50/50' : ''}`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-xl">${bid.amount.toLocaleString()}</span>
                              {isWinner && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">Winner</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {bid.bidderEmail}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                              <Clock className="h-3 w-3" />
                              {format(new Date(bid.createdAt), "MMM d, h:mm a")}
                            </div>
                          </div>

                          {!isClosed ? (
                            <Button 
                              onClick={() => setIsClosing(bid.id)}
                              disabled={isClosing === bid.id}
                              className="md:w-auto w-full font-bold"
                              data-testid={`button-accept-bid-${bid.id}`}
                            >
                              {isClosing === bid.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Accept Best Offer"
                              )}
                            </Button>
                          ) : isWinner && (
                            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                              <CheckCircle2 className="h-5 w-5" />
                              Deal Finalized
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-lg">
              <CardHeader className="bg-secondary/20 pb-6 border-b border-border/50">
                <CardTitle className="text-lg">Auction Details</CardTitle>
                <CardDescription>Managed via {room.planType} plan</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Deadline</div>
                  <div className="font-medium">{format(new Date(room.deadline), "PPP")}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Seller Email</div>
                  <div className="font-medium">{room.sellerEmail}</div>
                </div>
                {isClosed && winningBid && (
                  <div className="pt-4 mt-4 border-t border-border space-y-3">
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                      <Trophy className="h-5 w-5" />
                      Winning Offer
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="text-2xl font-display font-bold text-green-700">${winningBid.amount.toLocaleString()}</div>
                      <div className="text-sm text-green-600 mt-1">{winningBid.bidderEmail}</div>
                      <p className="text-[10px] text-green-500 mt-4 leading-tight">
                        Contact the buyer directly to finalize payment and delivery. The bidding room is now locked.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {!isClosed && (
              <Card className="bg-yellow-50/50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-yellow-800 uppercase tracking-tighter">Pro Tip</div>
                      <p className="text-xs text-yellow-700 leading-relaxed">
                        You can accept any bid at any time. Once you click "Accept Best Offer", the room will be locked and the deal is finalized.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Dialog Placeholder for speed, using native confirm for now */}
      {isClosing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader>
              <CardTitle>Accept this offer?</CardTitle>
              <CardDescription>
                This will close the bidding room and finalize the deal with this buyer.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsClosing(null)} disabled={closeAuctionMutation.isPending} data-testid="button-cancel-close">
                Cancel
              </Button>
              <Button onClick={() => closeAuctionMutation.mutate(isClosing!)} disabled={closeAuctionMutation.isPending} data-testid="button-confirm-close">
                {closeAuctionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Acceptance"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
