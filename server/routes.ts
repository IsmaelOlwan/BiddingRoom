import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { createRoomApiSchema, placeBidApiSchema } from "@shared/schema";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { sendEmail, emailTemplates } from "./email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
      const stripe = await getUncachableStripeClient();
      const products = await stripe.products.list({ active: true });
      const prices = await stripe.prices.list({ active: true });

      const results = products.data.map(product => {
        const productPrice = prices.data.find(price => price.product === product.id);
        return {
          product_id: product.id,
          product_name: product.name,
          product_description: product.description,
          product_metadata: product.metadata,
          price_id: productPrice?.id,
          unit_amount: productPrice?.unit_amount,
          currency: productPrice?.currency
        };
      });

      res.json({ prices: results });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const data = createRoomApiSchema.parse(req.body);
      
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
      
      const products = await stripe.products.list({
        active: true,
      });

      const product = products.data.find(p => p.metadata.planType === room.planType);

      if (!product) {
        return res.status(404).json({ error: `Product not found for plan: ${room.planType}` });
      }

      const productId = product.id;
      
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

  app.get("/api/rooms/:roomId/verify-payment", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { session_id } = req.query;

      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (!session_id || typeof session_id !== "string") {
        return res.status(400).json({ error: "Session ID required" });
      }

      if (room.stripeSessionId !== session_id) {
        return res.status(403).json({ error: "Invalid session for this room" });
      }

      if (room.isPaid) {
        return res.json({ 
          paid: true, 
          room: {
            id: room.id,
            title: room.title,
            planType: room.planType,
            ownerToken: room.ownerToken,
          }
        });
      }

      // Fallback: Check Stripe directly if webhook hasn't fired yet
      try {
        const stripe = await getUncachableStripeClient();
        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        if (session.payment_status === 'paid') {
          await storage.markRoomPaid(roomId);
          
          // Send room ready email
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          const ownerLink = `${baseUrl}/room/owner/${room.ownerToken}`;
          sendEmail(
            room.sellerEmail,
            `Your OfferRoom for ${room.title} is ready!`,
            emailTemplates.roomReady(room.title, ownerLink)
          ).catch(err => console.error("Email error:", err));
          
          return res.json({ 
            paid: true, 
            room: {
              id: room.id,
              title: room.title,
              planType: room.planType,
              ownerToken: room.ownerToken,
            }
          });
        }
      } catch (stripeError) {
        console.error("Stripe verification fallback error:", stripeError);
      }

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

      if (room.winningBidId) {
        return res.status(400).json({ error: "Auction has been closed" });
      }

      if (new Date() >= new Date(room.deadline)) {
        return res.status(400).json({ error: "Bidding has ended" });
      }

      const data = placeBidApiSchema.parse(req.body);
      
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

      // Send notifications asynchronously
      (async () => {
        try {
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          const adminLink = `${baseUrl}/room/owner/${room.ownerToken}`;
          const roomLink = `${baseUrl}/room/${roomId}`;

          // Notify seller
          await sendEmail(
            room.sellerEmail,
            `New bid on ${room.title}: $${bid.amount.toLocaleString()}`,
            emailTemplates.newBid(room.title, bid.amount, adminLink)
          );

          // Confirm to bidder
          await sendEmail(
            bid.bidderEmail,
            `Bid confirmed: ${room.title}`,
            emailTemplates.bidConfirmation(room.title, bid.amount, roomLink)
          );
        } catch (err) {
          console.error("Failed to send bid notification emails:", err);
        }
      })();

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

      if (!room.isPaid) {
        return res.status(403).json({ 
          error: "Room not activated yet",
          pending: true,
          message: "Payment is still processing. Please complete payment or wait for confirmation."
        });
      }

      const bids = await storage.getBidsForRoom(room.id);
      
      res.json({ 
        room: {
          id: room.id,
          title: room.title,
          description: room.description,
          images: room.images,
          deadline: room.deadline,
          sellerEmail: room.sellerEmail,
          planType: room.planType,
          winningBidId: room.winningBidId,
        },
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

      if (!room.isPaid) {
        return res.status(400).json({ error: "Room not activated" });
      }

      if (room.winningBidId) {
        return res.status(400).json({ error: "Auction already closed" });
      }

      const bids = await storage.getBidsForRoom(roomId);
      const bid = bids.find(b => b.id === bidId);
      if (!bid) {
        return res.status(400).json({ error: "Invalid bid for this room" });
      }

      const updatedRoom = await storage.closeAuction(roomId, bidId);

      // Send auction closed emails asynchronously
      (async () => {
        try {
          // Notify seller with winner's contact
          await sendEmail(
            room.sellerEmail,
            `Auction closed: ${room.title}`,
            emailTemplates.auctionClosedSeller(room.title, bid.bidderEmail, bid.amount)
          );

          // Notify winning bidder with seller's contact
          await sendEmail(
            bid.bidderEmail,
            `You won the auction: ${room.title}`,
            emailTemplates.auctionClosedWinner(room.title, room.sellerEmail, bid.amount)
          );
        } catch (err) {
          console.error("Failed to send auction closed emails:", err);
        }
      })();

      res.json({ room: updatedRoom });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
