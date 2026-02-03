import { 
  biddingRooms, 
  bids, 
  type InsertBiddingRoom, 
  type BiddingRoom, 
  type InsertBid, 
  type Bid 
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  createRoom(room: InsertBiddingRoom): Promise<BiddingRoom>;
  getRoom(id: string): Promise<BiddingRoom | undefined>;
  getRoomByStripeSession(sessionId: string): Promise<BiddingRoom | undefined>;
  updateRoom(id: string, data: Partial<BiddingRoom>): Promise<BiddingRoom | undefined>;
  markRoomPaid(id: string): Promise<BiddingRoom | undefined>;
  
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsForRoom(roomId: string): Promise<Bid[]>;
  getHighestBid(roomId: string): Promise<Bid | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createRoom(room: InsertBiddingRoom): Promise<BiddingRoom> {
    const [newRoom] = await db.insert(biddingRooms).values(room).returning();
    return newRoom;
  }

  async getRoom(id: string): Promise<BiddingRoom | undefined> {
    const [room] = await db.select().from(biddingRooms).where(eq(biddingRooms.id, id));
    return room;
  }

  async getRoomByStripeSession(sessionId: string): Promise<BiddingRoom | undefined> {
    const [room] = await db.select().from(biddingRooms).where(eq(biddingRooms.stripeSessionId, sessionId));
    return room;
  }

  async updateRoom(id: string, data: Partial<BiddingRoom>): Promise<BiddingRoom | undefined> {
    const [updatedRoom] = await db.update(biddingRooms).set(data).where(eq(biddingRooms.id, id)).returning();
    return updatedRoom;
  }

  async markRoomPaid(id: string): Promise<BiddingRoom | undefined> {
    return this.updateRoom(id, { isPaid: true });
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    return newBid;
  }

  async getBidsForRoom(roomId: string): Promise<Bid[]> {
    return db.select().from(bids).where(eq(bids.roomId, roomId)).orderBy(desc(bids.amount));
  }

  async getHighestBid(roomId: string): Promise<Bid | undefined> {
    const [highestBid] = await db
      .select()
      .from(bids)
      .where(eq(bids.roomId, roomId))
      .orderBy(desc(bids.amount))
      .limit(1);
    return highestBid;
  }
}

export const storage = new DatabaseStorage();
