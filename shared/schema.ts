import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  amount: integer("amount").notNull(),
  bidderEmail: text("bidder_email").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const biddingRooms = pgTable("bidding_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  images: text("images").array().notNull().default(sql`'{}'::text[]`),
  deadline: timestamp("deadline").notNull(),
  sellerEmail: text("seller_email").notNull(),
  planType: text("plan_type").notNull().default("basic"),
  stripeSessionId: text("stripe_session_id"),
  stripePriceId: text("stripe_price_id"),
  isPaid: boolean("is_paid").notNull().default(false),
  ownerToken: varchar("owner_token").notNull().default(sql`gen_random_uuid()`),
  winningBidId: varchar("winning_bid_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

const imagePathSchema = z.string().refine(
  (path) => path.startsWith("/objects/") || path.startsWith("https://"),
  "Images must be object storage paths (/objects/...) or HTTPS URLs"
);

export const insertBiddingRoomSchema = createInsertSchema(biddingRooms, {
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  deadline: z.coerce.date(),
  sellerEmail: z.string().email("Must be a valid email"),
  images: z.array(imagePathSchema).optional().default([]),
}).omit({
  id: true,
  isPaid: true,
  ownerToken: true,
  winningBidId: true,
  createdAt: true,
});

export const createRoomApiSchema = insertBiddingRoomSchema.extend({
  deadline: z.string().transform((str) => new Date(str)),
  planType: z.enum(["basic", "standard", "pro"]),
});

export const placeBidApiSchema = z.object({
  amount: z.number().positive("Bid amount must be positive"),
  bidderEmail: z.string().email("Must be a valid email"),
});

export type InsertBiddingRoom = z.infer<typeof insertBiddingRoomSchema>;
export type BiddingRoom = typeof biddingRooms.$inferSelect;

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
});

export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
