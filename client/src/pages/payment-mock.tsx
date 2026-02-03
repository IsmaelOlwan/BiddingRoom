import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function PaymentMockPage() {
  const [, setLocation] = useLocation();
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setLocation("/room/ready/12345"); // Mock ID
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-xs">S</div>
            <span className="font-bold text-lg">Stripe Checkout (Mock)</span>
          </div>
          <CardTitle className="text-2xl">Pay $19.00</CardTitle>
          <CardDescription>Standard Bidding Room</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-md border text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>$19.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>$0.00</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total due</span>
              <span>$19.00</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Payment details</div>
            <div className="p-3 border rounded-md bg-white flex items-center gap-3">
              <div className="w-8 h-5 bg-blue-600 rounded-sm"></div>
              <span className="text-sm">•••• 4242</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button 
            className="w-full h-11 text-lg" 
            onClick={handlePay} 
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay $19.00"
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            <span>Payments secured by Stripe</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
