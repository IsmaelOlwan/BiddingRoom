import { useState, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { format, differenceInSeconds } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Clock, ShieldCheck, Mail, AlertCircle, CheckCircle2, Loader2, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  bidderLabel?: string;
}

interface RoomData {
  room: {
    id: string;
    title: string;
    description: string;
    images: string[];
    deadline: string;
    planType: string;
  };
  bids: Bid[];
  highestBid: number;
  totalBids: number;
}

export default function BiddingRoomPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState("");
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data, isLoading, error } = useQuery<RoomData>({
    queryKey: ["room", id],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load room");
      }
      return res.json();
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!data?.room?.deadline) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      const deadline = new Date(data.room.deadline);
      const diff = differenceInSeconds(deadline, now);
      
      if (diff <= 0) {
        setTimeLeft("Ended");
        setIsEnded(true);
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.room?.deadline]);

  const placeBidMutation = useMutation({
    mutationFn: async () => {
      const amount = parseInt(bidAmount);
      const res = await apiRequest("POST", `/api/rooms/${id}/bids`, {
        amount,
        bidderEmail: email,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to place bid");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", id] });
      setBidAmount("");
      setIsDialogOpen(false);
      toast({
        title: "Bid Placed Successfully",
        description: `You have bid $${parseInt(bidAmount).toLocaleString()}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Bid Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseInt(bidAmount);
    if (!amount || (data && amount <= data.highestBid)) {
      toast({
        title: "Invalid Bid",
        description: "Your bid must be higher than the current highest bid.",
        variant: "destructive"
      });
      return;
    }

    placeBidMutation.mutate();
  };

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
        <h1 className="text-2xl font-display font-bold mb-2">Room Not Found</h1>
        <p className="text-muted-foreground">
          {error?.message || "This bidding room doesn't exist or hasn't been activated yet."}
        </p>
      </div>
    );
  }

  const { room, bids, highestBid, totalBids } = data;
  const userTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const formattedDeadline = useMemo(() => {
    if (!room.deadline) return "";
    return formatInTimeZone(new Date(room.deadline), userTimezone, "PPP 'at' h:mm a zzz");
  }, [room.deadline, userTimezone]);

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-display font-bold text-lg">OfferRoom</div>
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-2 font-mono text-sm font-bold px-3 py-1 rounded-full ${
              isEnded 
                ? "text-muted-foreground bg-muted" 
                : "text-destructive bg-destructive/10"
            }`}>
              <Clock className="h-4 w-4" />
              {timeLeft || "Loading..."}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Ends: {formattedDeadline}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-display font-bold" data-testid="text-room-title">
                {room.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Private Bidding Room
              </div>
            </div>

            {room.images && room.images.length > 0 ? (
              <div className="space-y-3">
                <div className="relative aspect-video bg-secondary/20 rounded-xl overflow-hidden border border-border">
                  <img 
                    src={room.images[selectedImageIndex]} 
                    alt={`${room.title} - Image ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    data-testid="image-main"
                  />
                  {room.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex(i => (i > 0 ? i - 1 : room.images.length - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2"
                        data-testid="button-prev-image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex(i => (i < room.images.length - 1 ? i + 1 : 0))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2"
                        data-testid="button-next-image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-2 right-2 bg-background/80 rounded-full px-2 py-1 text-xs">
                        {selectedImageIndex + 1} / {room.images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {room.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {room.images.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImageIndex(i)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          i === selectedImageIndex ? "border-primary" : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`button-thumbnail-${i}`}
                      >
                        <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-secondary/20 rounded-xl border border-border flex flex-col items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No images available</p>
              </div>
            )}

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-room-description">
                  {room.description}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-lg sticky top-24">
              <CardHeader className="bg-secondary/20 pb-6 border-b border-border/50">
                <CardDescription className="text-xs uppercase tracking-widest font-bold">
                  Current Highest Bid
                </CardDescription>
                <div className="text-4xl font-display font-bold text-primary mt-1" data-testid="text-highest-bid">
                  ${highestBid.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {totalBids} {totalBids === 1 ? "bid" : "bids"} placed
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                {bids.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Recent Activity</div>
                    <div className="space-y-3">
                      {bids.slice(0, 5).map((bid) => (
                        <div 
                          key={bid.id} 
                          className="flex justify-between items-center text-sm p-2 rounded hover:bg-secondary/30 transition-colors"
                          data-testid={`bid-item-${bid.id}`}
                        >
                          <div className="text-muted-foreground font-mono">
                            {bid.bidderLabel || "Bid"}
                          </div>
                          <div className="font-bold">
                            ${bid.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="w-full text-lg h-12 font-bold shadow-md"
                      disabled={isEnded}
                      data-testid="button-place-bid"
                    >
                      {isEnded ? "Bidding Ended" : "Place Bid"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Place a Bid</DialogTitle>
                      <DialogDescription>
                        You are bidding on {room.title}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handlePlaceBid} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Your Offer (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input 
                            type="number" 
                            className="pl-7" 
                            placeholder={`${(highestBid + 100).toLocaleString()}`}
                            min={highestBid + 1}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            required
                            data-testid="input-bid-amount"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Minimum bid: ${(highestBid + 1).toLocaleString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Your Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email" 
                            className="pl-9" 
                            placeholder="you@company.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            data-testid="input-bidder-email"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Your identity is kept private from other bidders.
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full mt-2"
                        disabled={placeBidMutation.isPending}
                        data-testid="button-confirm-bid"
                      >
                        {placeBidMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Placing bid...
                          </>
                        ) : (
                          "Confirm Bid"
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
              <CardFooter className="bg-secondary/10 border-t border-border/50 p-4">
                <div className="text-xs text-center w-full text-muted-foreground flex items-center justify-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Bids are binding.
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
