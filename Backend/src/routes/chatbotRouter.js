const express = require("express");
const Groq = require("groq-sdk");
const { userauth } = require("../middlewares/auth");
const BotConversation = require("../models/botConversation");

const chatbotRouter = express.Router();

const SYSTEM_PROMPT = `You are LoveBot, an AI assistant for LoveNest — a modern dating and relationship app. 
You help users with:
- Dating advice and tips for meaningful connections
- Relationship guidance and communication strategies
- Profile improvement suggestions
- Conversation starters and icebreakers
- General emotional support and companionship
Be warm, empathetic, and encouraging. Keep responses concise (2-4 sentences) unless asked for more detail.`;

function getGroqClient() {
    if (!process.env.GROQ_API_KEY) return null;
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// POST /chatbot/message — send a message to the AI chatbot
chatbotRouter.post("/chatbot/message", userauth, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message?.trim()) return res.status(400).json({ message: "message is required" });

        const groq = getGroqClient();
        if (!groq) return res.status(503).json({ message: "AI chatbot is not configured" });

        // Load or create conversation history
        let convo = await BotConversation.findOne({ userId: req.user._id });
        if (!convo) {
            convo = new BotConversation({ userId: req.user._id, messages: [] });
        }

        // Keep last 20 messages for context window
        const history = convo.messages.slice(-20).map(m => ({
            role: m.role,
            content: m.content,
        }));

        history.push({ role: "user", content: message.trim() });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...history,
            ],
            max_tokens: 512,
            temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content || "I'm here for you! What's on your mind?";

        // Persist conversation
        convo.messages.push({ role: "user", content: message.trim() });
        convo.messages.push({ role: "assistant", content: reply });

        // Trim to last 100 messages to avoid unbounded growth
        if (convo.messages.length > 100) {
            convo.messages = convo.messages.slice(-100);
        }
        await convo.save();

        res.json({ success: true, reply });
    } catch (err) {
        console.error("[chatbot/message]", err.message);
        res.status(500).json({ message: "AI service error", error: err.message });
    }
});

// GET /chatbot/history — fetch conversation history
chatbotRouter.get("/chatbot/history", userauth, async (req, res) => {
    try {
        const convo = await BotConversation.findOne({ userId: req.user._id }).lean();
        res.json({ success: true, messages: convo?.messages || [] });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch history", error: err.message });
    }
});

// DELETE /chatbot/history — clear conversation history
chatbotRouter.delete("/chatbot/history", userauth, async (req, res) => {
    try {
        await BotConversation.deleteOne({ userId: req.user._id });
        res.json({ success: true, message: "Conversation cleared" });
    } catch (err) {
        res.status(500).json({ message: "Failed to clear history", error: err.message });
    }
});

module.exports = chatbotRouter;
