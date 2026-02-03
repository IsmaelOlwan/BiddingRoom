import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { format, differenceInSeconds, addHours } from "date-fns";
import { Clock, ShieldCheck, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Mock Data
const MOCK_ASSET = {
  id: "12345",
  title: "2018 Industrial CNC Machine - Haas VF-2SS",
  description: "Excellent condition Haas VF-2SS vertical machining center. Low hours (3,200 spindle hours). Includes chip auger, programmable coolant nozzle, and 12,000 RPM spindle. Maintained annually by certified technicians. Available for immediate pickup in Stockholm.",
  images: [
    "/images/hero-bg.png", // Reusing existing assets for now
    "/images/hero-bg.png",
    "/images/hero-bg.png"
  ],
  seller: "TechManufacturing AB",
  deadline: addHours(new Date(), 24), // Ends in 24 hours
  bids: [
    { id: 1, amount: 12500, time: addHours(new Date(), -2) },
    { id: 2, amount: 13200, time: addHours(new Date(), -1) },
    { id: 3, amount: 14000, time: addHours(new Date(), -0.5) },
  ]
};

export default function BiddingRoomPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState("");
  const [email, setEmail] = useState("");
  const [bids, setBids] = useState(MOCK_ASSET.bids);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = differenceInSeconds(MOCK_ASSET.deadline, now);
      
      if (diff <= 0) {
        setTimeLeft("Ended");
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const amount = parseInt(bidAmount);
    if (!amount || amount <= bids[bids.length - 1].amount) {
      toast({
        title: "Invalid Bid",
        description: "Your bid must be higher than the current highest bid.",
        variant: "destructive"
      });
      return;
    }

    // Add mock bid
    const newBid = {
      id: bids.length + 1,
      amount: amount,
      time: new Date()
    };
    
    setBids([newBid, ...bids].sort((a, b) => a.amount - b.amount)); // Keep sorted
    setBidAmount("");
    setIsDialogOpen(false);
    
    toast({
      title: "Bid Placed Successfully",
      description: `You have bid $${amount.toLocaleString()}`,
    });
  };

  const currentHighest = bids.length > 0 ? bids[bids.length - 1].amount : 0;

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-display font-bold text-lg">Bidding Room #{id}</div>
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-destructive bg-destructive/10 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4" />
            {timeLeft}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Asset Info & Images */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-display font-bold">{MOCK_ASSET.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Verified Seller: <span className="font-medium text-foreground">{MOCK_ASSET.seller}</span>
              </div>
            </div>

            <Carousel className="w-full bg-secondary/20 rounded-xl overflow-hidden border border-border">
              <CarouselContent>
                {MOCK_ASSET.images.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative">
                      <img 
                        src={img} 
                        alt={`Asset view ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {MOCK_ASSET.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Bidding Interface */}
          <div className="space-y-6">
            <Card className="border-border shadow-lg sticky top-24">
              <CardHeader className="bg-secondary/20 pb-6 border-b border-border/50">
                <CardDescription className="text-xs uppercase tracking-widest font-bold">Current Highest Bid</CardDescription>
                <div className="text-4xl font-display font-bold text-primary mt-1">
                  ${currentHighest.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {bids.length} bids placed
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="text-sm font-medium">Recent Activity</div>
                  <div className="space-y-3">
                    {[...bids].reverse().slice(0, 5).map((bid) => (
                      <div key={bid.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-secondary/30 transition-colors">
                        <div className="text-muted-foreground font-mono">
                          Bid #{bid.id}
                        </div>
                        <div className="font-bold">
                          ${bid.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full text-lg h-12 font-bold shadow-md">
                      Place Bid
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Place a Bid</DialogTitle>
                      <DialogDescription>
                        You are bidding on {MOCK_ASSET.title}
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
                            placeholder={`${(currentHighest + 100).toLocaleString()}`}
                            min={currentHighest + 1}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Minimum bid: ${(currentHighest + 1).toLocaleString()}
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
                          />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Your identity is kept private from other bidders.
                        </p>
                      </div>

                      <Button type="submit" className="w-full mt-2">
                        Confirm Bid
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
