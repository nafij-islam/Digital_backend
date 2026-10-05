import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db.js";
import Product from "../models/Product.js";

const initialProducts = [
  {
    name: "Canva Pro Subscription",
    slug: "canva-pro-subscription",
    badge: "Best Seller",
    price: 150,
    originalPrice: 350,
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    cloudinaryPublicId: null,
    description:
      "Unlock unlimited premium templates, magic AI resize, 1-click background remover, brand kits, and over 100 million stock photos, videos, and graphics on your personal email.",
    isActive: true,
  },
  {
    name: "ChatGPT Plus (GPT-4o & o1)",
    slug: "chatgpt-plus-gpt-4o-o1",
    badge: "Most Popular",
    price: 650,
    originalPrice: 1100,
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
    cloudinaryPublicId: null,
    description:
      "Get direct access to OpenAI's flagship GPT-4o multimodal model, advanced reasoning o1, natural speech real-time voice mode, DALL·E 3 image generation, and custom GPTs.",
    isActive: true,
  },
  {
    name: "Google Gemini Advanced",
    slug: "google-gemini-advanced",
    badge: "2TB Included",
    price: 550,
    originalPrice: 900,
    imageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    cloudinaryPublicId: null,
    description:
      "Supercharge your workflow with Google's most capable 1.5 Pro AI model with 1M token context window, seamless Google Docs & Gmail integration, and 2TB Google One cloud storage.",
    isActive: true,
  },
  {
    name: "YouTube Premium & Music",
    slug: "youtube-premium-music",
    badge: "Ad-Free Stream",
    price: 150,
    originalPrice: 300,
    imageUrl:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80",
    cloudinaryPublicId: null,
    description:
      "Enjoy 100% ad-free video streaming across mobile, TV, and web, background audio playback with screen locked, offline video downloads, and high-fidelity YouTube Music Premium.",
    isActive: true,
  },
  {
    name: "Google Antigravity AI IDE",
    slug: "google-antigravity-ai-ide",
    badge: "Next-Gen AI",
    price: 500,
    originalPrice: 950,
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    cloudinaryPublicId: null,
    description:
      "Experience next-generation agentic AI software engineering with autonomous multi-file refactoring, terminal execution, subagent delegation, and intelligent debugging workflows.",
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting shop.nafij product seeding process...");

    await connectDB();

    console.log("🧹 Clearing existing products collection...");
    await Product.deleteMany({});
    console.log("✓ Existing products cleared.");

    console.log(`📦 Inserting ${initialProducts.length} verified digital subscription products...`);
    const createdProducts = await Product.insertMany(initialProducts);

    console.log("\n================ SEEDED PRODUCTS ================");
    createdProducts.forEach((p, idx) => {
      console.log(
        `${idx + 1}. [${p.badge || "Standard"}] ${p.name} - ৳${p.price} (Original: ৳${p.originalPrice || "N/A"}) | Slug: ${p.slug}`
      );
    });
    console.log("==================================================");

    console.log("\n🎉 Database seeded successfully with all 5 products!");
  } catch (error) {
    console.error("❌ Seeding failed with error:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    console.log("👋 Seeding script finished.");
    process.exit();
  }
};

seedDatabase();
