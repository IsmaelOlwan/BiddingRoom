import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { insertBiddingRoomSchema, insertBidSchema } from "@shared/schema";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

const createRoomSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  images: z.array(z.string()).optional().default([]),
  deadline: z.string().transform((str) => new Date(str)),
  sellerEmail: z.string().email(),
  planType: z.enum(["basic", "standard", "pro"]),
});

const placeBidSchema = z.object({
  amount: z.number().positive(),
  bidderEmail: z.string().email(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register object storage routes for image uploads
  registerObjectStorageRoutes(app);
  
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/prices", async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency
        FROM stripe.products p
        JOIN stripe.prices pr ON pr.product = p.id
        WHERE p.active = true AND pr.active = true
        ORDER BY pr.unit_amount
      `);
      res.json({ prices: result.rows });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const data = createRoomSchema.parse(req.body);
      
      const room = await storage.createRoom({
        title: data.title,
        description: data.description,
        images: data.images,
        deadline: data.deadline,
        sellerEmail: data.sellerEmail,
        planType: data.planType,
        stripeSessionId: null,
        stripePriceId: null,
      });

      res.json({ room });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rooms/:roomId/checkout", async (req, res) => {
    try {
      const { roomId } = req.params;
      
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (room.isPaid) {
        return res.status(400).json({ error: "Room already paid" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Query Stripe API directly for products with matching planType
      const products = await stripe.products.search({
        query: `metadata['planType']:'${room.planType}' AND active:'true'`,
      });

      if (products.data.length === 0) {
        return res.status(404).json({ error: "Product not found for plan" });
      }

      const productId = products.data[0].id;
      
      // Get active price for this product
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 1,
      });

      if (prices.data.length === 0) {
        return res.status(404).json({ error: "Price not found for plan" });
      }

      const priceId = prices.data[0].id;
      
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${baseUrl}/room/ready/${roomId}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/create`,
        customer_email: room.sellerEmail,
        metadata: {
          roomId: roomId,
        },
      });

      await storage.updateRoom(roomId, {
        stripeSessionId: session.id,
        stripePriceId: priceId,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify payment status - ONLY checks status, does NOT activate rooms
  // Room activation happens ONLY via Stripe webhook (checkout.session.completed)
  app.get("/api/rooms/:roomId/verify-payment", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { session_id } = req.query;

      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // If already paid (activated by webhook), return success
      if (room.isPaid) {
        return res.json({ 
          paid: true, 
          room: {
            id: room.id,
            title: room.title,
            planType: room.planType,
          }
        });
      }

      // Validate session belongs to this room
      if (session_id && typeof session_id === "string") {
        if (room.stripeSessionId !== session_id) {
          return res.status(400).json({ error: "Invalid session for this room" });
        }
      }

      // Room not yet activated by webhook - return pending status
      // Client should poll this endpoint until webhook activates the room
      res.json({ 
        paid: false, 
        pending: true,
        message: "Payment is being processed. Please wait..."
      });
    } catch (error: any) {
      console.error("Verify payment error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rooms/:roomId", async (req, res) => {
    try {
      const { roomId } = req.params;
      
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (!room.isPaid) {
        return res.status(403).json({ error: "Room not activated" });
      }

      const bids = await storage.getBidsForRoom(roomId);
      
      const anonymizedBids = room.planType === "basic" 
        ? bids.map(bid => ({ 
            id: bid.id, 
            amount: bid.amount, 
            createdAt: bid.createdAt 
          }))
        : bids.map((bid, index) => ({ 
            id: bid.id, 
            amount: bid.amount, 
            createdAt: bid.createdAt,
            bidderLabel: `Buyer ${bids.length - index}`
          }));

      res.json({ 
        room: {
          id: room.id,
          title: room.title,
          description: room.description,
          images: room.images,
          deadline: room.deadline,
          planType: room.planType,
        },
        bids: anonymizedBids,
        highestBid: bids.length > 0 ? bids[0].amount : 0,
        totalBids: bids.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rooms/:roomId/bids", async (req, res) => {
    try {
      const { roomId } = req.params;
      
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (!room.isPaid) {
        return res.status(403).json({ error: "Room not activated" });
      }

      if (new Date() > new Date(room.deadline)) {
        return res.status(400).json({ error: "Bidding has ended" });
      }

      // Final safety check: deadline must be at least 1 hour in the future when bidding
      // to account for clock drift or last-second submissions
      const now = new Date();
      const deadlineDate = new Date(room.deadline);
      if (now >= deadlineDate) {
        return res.status(400).json({ error: "Bidding has ended (server-side check)" });
      }

      const data = placeBidSchema.parse(req.body);
      
      const highestBid = await storage.getHighestBid(roomId);
      if (highestBid && data.amount <= highestBid.amount) {
        return res.status(400).json({ 
          error: "Bid must be higher than current highest bid",
          currentHighest: highestBid.amount 
        });
      }

      const bid = await storage.createBid({
        roomId,
        amount: data.amount,
        bidderEmail: data.bidderEmail,
      });

      res.json({ bid: { id: bid.id, amount: bid.amount, createdAt: bid.createdAt } });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rooms/owner/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const room = await storage.getRoomByOwnerToken(token);
      
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const bids = await storage.getBidsForRoom(room.id);
      
      res.json({ 
        room,
        bids,
        highestBid: bids.length > 0 ? bids[0].amount : 0,
        totalBids: bids.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rooms/:roomId/close", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { token, bidId } = req.body;

      const room = await storage.getRoom(roomId);
      if (!room || room.ownerToken !== token) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updatedRoom = await storage.closeAuction(roomId, bidId);
      res.json({ room: updatedRoom });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
