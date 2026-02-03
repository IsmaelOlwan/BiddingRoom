import { getStripeSync } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error('Payload must be a Buffer');
    }
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
  }

  static async handleCheckoutCompleted(sessionId: string): Promise<void> {
    const room = await storage.getRoomByStripeSession(sessionId);
    if (room) {
      await storage.markRoomPaid(room.id);
      console.log(`Room ${room.id} marked as paid`);
    }
  }
}
