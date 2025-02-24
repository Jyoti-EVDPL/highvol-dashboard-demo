const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const HELIUS_BASE_URL = process.env.HELIUS_BASE_URL || 'https://mainnet.helius-rpc.com';

app.use(express.json());

// Allow requests from Helius servers
app.use(cors({
    origin: '*', // Allow all origins (change this to specific origins if needed)
    methods: 'POST',
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/wallet/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const apiKey = process.env.HELIUS_API_KEY;

        const response = await axios.post(
            `${HELIUS_BASE_URL}/?api-key=${apiKey}`,
            {
                jsonrpc: "2.0",
                id: 1,
                method: "getAccountInfo",
                params: [address, { encoding: "jsonParsed" }]
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching wallet details", error: error.message });
    }
});


app.get('/transactions/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const apiKey = process.env.HELIUS_API_KEY;

        const response = await axios.post(
            `${HELIUS_BASE_URL}/?api-key=${apiKey}`,
            {
                jsonrpc: "2.0",
                id: 1,
                method: "getSignaturesForAddress",
                params: [address, { limit: 10 }] // Adjust limit as needed
            }
        );

        res.json(response.data.result);
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions", error: error.message });
    }
});


app.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const apiKey = process.env.HELIUS_API_KEY;

        const response = await axios.post(
            `${HELIUS_BASE_URL}/?api-key=${apiKey}`,
            {
                jsonrpc: "2.0",
                id: 1,
                method: "getBalance",
                params: [address]
            }
        );

        const balanceInSOL = response.data.result.value / 1e9; // Convert lamports to SOL

        res.json({ address, balance: balanceInSOL });
    } catch (error) {
        res.status(500).json({ message: "Error fetching balance", error: error.message });
    }
});

// Token Balances
app.get('/tokens/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const apiKey = process.env.HELIUS_API_KEY;

        const response = await axios.post(
            `${HELIUS_BASE_URL}/?api-key=${apiKey}`,
            {
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenAccountsByOwner",
                params: [address, { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }]
            }
        );

        res.json(response.data.result.value);
    } catch (error) {
        res.status(500).json({ message: "Error fetching token balances", error: error.message });
    }
});

// NFTs are SPL tokens with metadata.
app.get('/nfts/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const apiKey = process.env.HELIUS_API_KEY;

        const response = await axios.post(
            `${HELIUS_BASE_URL}/?api-key=${apiKey}`,
            {
                jsonrpc: "2.0",
                id: 1,
                method: "getAssetsByOwner",
                params: { ownerAddress: address }
            }
        );

        res.json(response.data.result);
    } catch (error) {
        res.status(500).json({ message: "Error fetching NFTs", error: error.message });
    }
});

app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.status(200).send('Received');
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
