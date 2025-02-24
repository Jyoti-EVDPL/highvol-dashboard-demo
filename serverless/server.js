const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require('cors');


const app = express();
app.use(express.json());

// Allow requests from Helius servers
app.use(cors({
    origin: '*', // Allow all origins (change this to specific origins if needed)
    methods: 'POST',
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Webhook Schema
const WebhookSchema = new mongoose.Schema({ data: Object, receivedAt: { type: Date, default: Date.now } });
const WebhookModel = mongoose.model("transactions", WebhookSchema);

// Webhook Endpoint
app.post("/webhook", async (req, res) => {
  try {
    console.log("📩 Webhook Received:", req.body);
    await new WebhookModel({ data: req.body }).save();
    res.status(200).json({ message: "✅ Webhook stored successfully" });
  } catch (error) {
    console.error("❌ Error storing webhook:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Local Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
