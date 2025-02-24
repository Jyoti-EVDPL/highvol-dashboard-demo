const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;

// Connect to MongoDB
const connectToDB = async () => {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  }
};

// Webhook Schema
const WebhookSchema = new mongoose.Schema({ data: Object, receivedAt: { type: Date, default: Date.now } });
const WebhookModel = mongoose.models.Webhook || mongoose.model("Webhook", WebhookSchema);

// Serverless Handler
module.exports.handler = async (event) => {
  try {
    await connectToDB();
    const body = JSON.parse(event.body);
    console.log("📩 Webhook Received:", body);
    await new WebhookModel({ data: body }).save();
    return { statusCode: 200, body: JSON.stringify({ message: "✅ Webhook stored successfully" }) };
  } catch (error) {
    console.error("❌ Error storing webhook:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};
