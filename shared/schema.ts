import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertBiddingRoomSchema = createInsertSchema(biddingRooms).omit({
  id: true,
  isPaid: true,
  createdAt: true,
});

export type InsertBiddingRoom = z.infer<typeof insertBiddingRoomSchema>;
export type BiddingRoom = typeof biddingRooms.$inferSelect;

export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => biddingRooms.id),
  amount: integer("amount").notNull(),
  bidderEmail: text("bidder_email").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
});

export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
