import { getUncachableStripeClient } from "./stripeClient";

const PLANS = [
  {
    name: "Basic Room",
    description: "For quick, simple deals. 1 active room.",
    price: 900,
    metadata: {
      planType: "basic",
      maxRooms: "1"
    }
  },
  {
    name: "Standard Room",
    description: "For serious deals where structure is needed. 2 active rooms.",
    price: 1900,
    metadata: {
      planType: "standard",
      maxRooms: "2"
    }
  },
  {
    name: "Pro Room",
    description: "For higher value deals. 5 active rooms with export.",
    price: 2900,
    metadata: {
      planType: "pro",
      maxRooms: "5"
    }
  }
];

async function seedProducts() {
  const stripe = await getUncachableStripeClient();
  
  console.log("Creating Bidding Room products...");
  
  for (const plan of PLANS) {
    const existingProducts = await stripe.products.search({
      query: `name:'${plan.name}'`
    });
    
    if (existingProducts.data.length > 0) {
      console.log(`Product "${plan.name}" already exists, skipping...`);
      continue;
    }
    
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: plan.metadata
    });
    
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.price,
      currency: "usd"
    });
    
    console.log(`Created: ${plan.name} (${product.id}) - Price: ${price.id}`);
  }
  
  console.log("Done seeding products!");
}

seedProducts().catch(console.error);
