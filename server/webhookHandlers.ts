import { getStripeSync } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error('Payload must be a Buffer');
    }
    
    const sync = await getStripeSync();
    
    // Let stripe-replit-sync process the webhook (it handles verification internally)
    // It returns the parsed event after verification
    const event = await sync.processWebhook(payload, signature);
    
    console.log(`Webhook received: ${event.type}`);
    
    // Handle checkout.session.completed - THIS IS THE ONLY WAY TO ACTIVATE ROOMS
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      if (session.payment_status === 'paid') {
        const roomId = session.metadata?.roomId;
        
        if (roomId) {
          const room = await storage.getRoom(roomId);
          
          if (room && room.stripeSessionId === session.id && !room.isPaid) {
            await storage.markRoomPaid(roomId);
            console.log(`[WEBHOOK] Room ${roomId} activated after payment confirmation`);
          }
        }
      }
    }
  }
}
