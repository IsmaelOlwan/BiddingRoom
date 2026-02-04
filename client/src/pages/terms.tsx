import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-display font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p>
                By using OfferRoom, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">2. Description of Service</h2>
              <p>
                OfferRoom provides a platform for private asset bidding. We are not a marketplace and do not take commissions on sales. We charge a flat fee per bidding room.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">3. User Responsibilities</h2>
              <p>
                Sellers are responsible for the accuracy of asset descriptions. Buyers are responsible for the bids they place. All bids are considered binding offers to purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">4. Payments and Refunds</h2>
              <p>
                Room fees are non-refundable once the room has been activated. Payments are processed securely via Stripe.
              </p>
            </section>

            <section>
              <p className="text-sm italic">Last updated: {new Date().toLocaleDateString()}</p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
