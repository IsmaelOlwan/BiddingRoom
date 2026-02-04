import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you create a bidding room or place a bid. This includes your email address, asset descriptions, and bid amounts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to operate and maintain OfferRoom, including processing payments via Stripe and facilitating the bidding process between sellers and buyers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">3. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">4. Third-Party Services</h2>
              <p>
                We use Stripe for payment processing. Your payment information is handled directly by Stripe and is subject to their privacy policy.
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
