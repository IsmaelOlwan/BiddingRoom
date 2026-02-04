import { Resend } from 'resend';

// resend integration setup
let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );
  
  const data = await response.json();
  connectionSettings = data.items?.[0];

  if (!connectionSettings || !connectionSettings.settings?.api_key) {
    throw new Error('Resend not connected');
  }
  
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email || 'notifications@invitedoffer.com'
  };
}

export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    const result = await client.emails.send({
      from: `OfferRoom <${fromEmail}>`,
      to,
      subject,
      html
    });
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    return null;
  }
}

export const emailTemplates = {
  roomReady: (roomTitle: string, ownerLink: string) => `
    <h1>Your OfferRoom is ready!</h1>
    <p>Your bidding room for <strong>${roomTitle}</strong> is now live.</p>
    <p>You can manage your room and view bids here:</p>
    <a href="${ownerLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">View Admin Panel</a>
    <p>Keep this link private. It is your only way to manage the room.</p>
  `,
  newBid: (roomTitle: string, amount: number, adminLink: string) => `
    <h1>New Bid Received!</h1>
    <p>A new bid of <strong>$${amount.toLocaleString()}</strong> has been placed on <strong>${roomTitle}</strong>.</p>
    <p>Check all bids and manage your room here:</p>
    <a href="${adminLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">View Admin Panel</a>
  `,
  bidConfirmation: (roomTitle: string, amount: number, roomLink: string) => `
    <h1>Bid Confirmed</h1>
    <p>Your bid of <strong>$${amount.toLocaleString()}</strong> for <strong>${roomTitle}</strong> has been successfully placed.</p>
    <p>You can track the auction status here:</p>
    <a href="${roomLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">View Bidding Room</a>
  `,
  auctionClosedSeller: (roomTitle: string, winnerEmail: string, amount: number) => `
    <h1>Congratulations! Your auction has closed.</h1>
    <p>You have accepted an offer of <strong>$${amount.toLocaleString()}</strong> for <strong>${roomTitle}</strong>.</p>
    <p>The winning bidder's contact information:</p>
    <p style="font-size:18px;font-weight:bold;background:#f5f5f5;padding:12px;border-radius:6px;">${winnerEmail}</p>
    <p>Please reach out to coordinate payment and delivery of your asset.</p>
  `,
  auctionClosedWinner: (roomTitle: string, sellerEmail: string, amount: number) => `
    <h1>Congratulations! You won the auction!</h1>
    <p>Your bid of <strong>$${amount.toLocaleString()}</strong> for <strong>${roomTitle}</strong> has been accepted by the seller.</p>
    <p>The seller's contact information:</p>
    <p style="font-size:18px;font-weight:bold;background:#f5f5f5;padding:12px;border-radius:6px;">${sellerEmail}</p>
    <p>Please expect to be contacted soon to arrange payment and delivery.</p>
  `
};
