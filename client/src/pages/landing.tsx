import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Clock,
  Globe,
  Lock,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-display font-bold tracking-tighter">
            OfferRoom
          </div>
          <Link href="/create">
            <Button size="sm" className="hidden md:flex">Create your bidding room</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.h1
                variants={fadeIn}
                className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight text-primary"
              >
                Sell assets to multiple buyers —{" "}
                <span className="text-muted-foreground">
                  privately and fast
                </span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="text-xl text-muted-foreground md:w-4/5 leading-relaxed"
              >
                Create a private bidding room for your equipment, inventory, or
                assets. Invite selected buyers. Set a deadline. Close the deal.
              </motion.p>

              <motion.div
                variants={fadeIn}
                className="flex flex-col sm:flex-row gap-4 items-start"
              >
                <Link href="/create?plan=standard">
                  <Button size="lg" className="text-lg px-8 h-14" data-testid="button-hero-cta">
                    Create your bidding room <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>

              <motion.p
                variants={fadeIn}
                className="text-sm font-medium text-muted-foreground uppercase tracking-widest"
              >
                No marketplace. No commission. No middlemen.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-square md:aspect-[4/3] bg-secondary/50 rounded-2xl overflow-hidden shadow-2xl border border-border"
            >
              {/* Abstract Representation of a Bidding Room */}
              <img
                src="/images/hero-bg.png"
                alt="Asset Bidding Room"
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-border/50 bg-secondary/30">
        <div className="container mx-auto px-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8 text-center">
            Used for
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-70">
            {[
              "Machinery",
              "Equipment",
              "Inventory",
              "Surplus Stock",
              "Business Assets",
            ].map((item) => (
              <span
                key={item}
                className="text-xl font-display font-medium text-primary"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="md:w-2/3 mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Selling business assets shouldn’t be this hard
            </h2>
            <p className="text-xl text-muted-foreground">
              Most companies face the same problems when selling assets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Wrong Buyers",
                desc: "Public marketplaces attract unserious inquiries and lowballers.",
              },
              {
                title: "High Fees",
                desc: "Brokers take large commissions that eat into your profit.",
              },
              {
                title: "Messy Process",
                desc: "Email threads get messy. Buyers delay. You lose control.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-xl bg-secondary/20 border border-border hover:bg-secondary/40 transition-colors"
              >
                <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                  <div className="h-2 w-2 bg-destructive rounded-full" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                A private bidding room — under your control
              </h2>
              <div className="space-y-6">
                {[
                  "Present your asset professionally",
                  "Invite only serious buyers",
                  "Set a clear deadline",
                  "Compare offers in one place",
                  "Close faster — on your terms",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-6 w-6 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span className="text-lg opacity-90">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-8 pt-8 border-t border-primary-foreground/10 font-medium opacity-70">
                No public listing. No negotiation chaos.
              </p>
            </div>

            {/* Visual Abstract UI for Solution */}
            <div className="relative">
              <div className="absolute -inset-4 bg-primary-foreground/5 rounded-3xl blur-2xl" />
              <div className="relative bg-background text-foreground rounded-xl shadow-2xl p-8 border border-border/10">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Asset
                    </div>
                    <div className="font-bold">
                      Industrial Milling Machine X200
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Time Left
                    </div>
                    <div className="font-mono text-destructive font-bold">
                      24:00:00
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          B{i}
                        </div>
                        <div className="text-sm font-medium">Buyer {i}</div>
                      </div>
                      <div className="font-mono font-bold">
                        $12,{500 + i * 250}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button className="w-full">Accept Best Offer</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-border -z-10" />

            {[
              {
                step: "01",
                title: "Create Room",
                desc: "Add description, images, and deadline",
              },
              {
                step: "02",
                title: "Invite Buyers",
                desc: "Share private link with selected buyers",
              },
              {
                step: "03",
                title: "Receive Bids",
                desc: "Watch offers come in real-time",
              },
              {
                step: "04",
                title: "Close Deal",
                desc: "Choose the best offer and sign",
              },
            ].map((item, i) => (
              <div key={i} className="bg-background pt-4">
                <div className="h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold font-display mb-6 mx-auto shadow-lg ring-4 ring-background">
                  {item.step}
                </div>
                <div className="text-center px-4">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Simple pricing
          </h2>
          <p className="text-xl text-muted-foreground mb-16">
            No commission. No subscription. Pay per room.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Basic",
                planType: "basic" as const,
                price: "$9",
                desc: "For quick, simple deals.",
                features: [
                  "1 private bidding room",
                  "Description + images",
                  "Deadline",
                  "Share link with any number of buyers",
                  "View received bids",
                ],
                limits: "1 active room",
              },
              {
                name: "Standard",
                planType: "standard" as const,
                price: "$19",
                desc: "For serious deals where structure is needed.",
                features: [
                  "Everything in Basic",
                  "Anonymized bids (buyers see that bids exist, not who)",
                  "Bid history",
                  "Clearer closing view (“Best offer”)",
                ],
                limits: "2 active rooms simultaneously",
                recommended: true,
              },
              {
                name: "Pro",
                planType: "pro" as const,
                price: "$29",
                desc: "For higher value or more pressure in the deal.",
                features: [
                  "Everything in Standard",
                  "Decision-ready overview",
                  "Extend/change deadline once",
                  "Export (PDF / summary view)",
                ],
                limits: "5 active rooms simultaneously",
              },
            ].map((plan, i) => (
              <Card
                key={i}
                className={`relative flex flex-col transition-all duration-300 ${plan.recommended ? "border-primary shadow-2xl scale-105 z-10" : "border-border hover:border-primary/50"}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                    Recommended
                  </div>
                )}
                <CardHeader className="text-left pb-4">
                  <CardTitle className="text-xl font-bold tracking-tight">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-display font-bold tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm font-medium">
                      / room
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed min-h-[40px]">
                    {plan.desc}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col text-left">
                  <div className="space-y-6 flex-1">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">
                        Includes
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-3 text-sm leading-tight"
                          >
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {plan.limits && (
                      <div className="pt-4 border-t border-border/50">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                          Capacity
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {plan.limits}
                        </p>
                      </div>
                    )}
                  </div>
                  <Link href={`/create?plan=${plan.planType}`}>
                    <Button
                      variant={plan.recommended ? "default" : "outline"}
                      className="w-full mt-8 h-12 font-bold transition-all active:scale-[0.98]"
                      data-testid={`button-choose-${plan.planType}`}
                    >
                      Choose {plan.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-12 text-sm text-muted-foreground">
            You only pay when you need it.
          </p>
        </div>
      </section>

      {/* Why This Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">
            Why companies use private bidding rooms
          </h2>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
            {[
              { icon: Zap, label: "Faster decisions" },
              { icon: Users, label: "Serious buyers only" },
              { icon: Shield, label: "Professional presentation" },
              { icon: Lock, label: "Full control" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg bg-secondary/10"
              >
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-lg font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-2xl font-display font-medium text-primary">
              It’s how asset sales should work.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Ready to sell?
          </h2>
          <p className="text-xl opacity-80 mb-10 max-w-xl mx-auto">
            Create your first bidding room in minutes.
          </p>
          <Link href="/create?plan=standard">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 h-16 font-bold"
              data-testid="button-footer-cta"
            >
              Create your bidding room
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="font-display font-bold text-foreground mb-4 md:mb-0">
            OfferRoom
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </div>
          <div className="mt-4 md:mt-0">&copy; {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
}
