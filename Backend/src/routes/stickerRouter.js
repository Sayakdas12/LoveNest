const express = require("express");

const stickerRouter = express.Router();

// Sticker data — using widely available free emoji-style sticker packs
const STICKER_PACKS = [
    {
        id: "hearts",
        name: "Hearts & Love",
        stickers: [
            { id: "heart-eyes", emoji: "😍", label: "Heart Eyes" },
            { id: "red-heart", emoji: "❤️", label: "Red Heart" },
            { id: "sparkling-heart", emoji: "💖", label: "Sparkling Heart" },
            { id: "two-hearts", emoji: "💕", label: "Two Hearts" },
            { id: "heart-arrow", emoji: "💘", label: "Heart Arrow" },
            { id: "beating-heart", emoji: "💓", label: "Beating Heart" },
            { id: "revolving-hearts", emoji: "💞", label: "Revolving Hearts" },
            { id: "heart-ribbon", emoji: "💝", label: "Heart Ribbon" },
            { id: "kiss", emoji: "😘", label: "Kiss" },
            { id: "blush", emoji: "😊", label: "Blush" },
            { id: "wink", emoji: "😉", label: "Wink" },
            { id: "smiling-face", emoji: "🥰", label: "Smiling Face" },
        ],
    },
    {
        id: "fun",
        name: "Fun & Reactions",
        stickers: [
            { id: "laugh", emoji: "😂", label: "Laugh" },
            { id: "fire", emoji: "🔥", label: "Fire" },
            { id: "star-struck", emoji: "🤩", label: "Star Struck" },
            { id: "party", emoji: "🎉", label: "Party" },
            { id: "cool", emoji: "😎", label: "Cool" },
            { id: "thinking", emoji: "🤔", label: "Thinking" },
            { id: "shocked", emoji: "😱", label: "Shocked" },
            { id: "clap", emoji: "👏", label: "Clap" },
            { id: "thumbsup", emoji: "👍", label: "Thumbs Up" },
            { id: "wave", emoji: "👋", label: "Wave" },
            { id: "ok", emoji: "🆗", label: "OK" },
            { id: "rose", emoji: "🌹", label: "Rose" },
        ],
    },
    {
        id: "animals",
        name: "Cute Animals",
        stickers: [
            { id: "cat-heart", emoji: "😻", label: "Cat Heart" },
            { id: "dog", emoji: "🐶", label: "Dog" },
            { id: "bunny", emoji: "🐰", label: "Bunny" },
            { id: "bear", emoji: "🐻", label: "Bear" },
            { id: "panda", emoji: "🐼", label: "Panda" },
            { id: "fox", emoji: "🦊", label: "Fox" },
            { id: "owl", emoji: "🦉", label: "Owl" },
            { id: "butterfly", emoji: "🦋", label: "Butterfly" },
            { id: "dove", emoji: "🕊️", label: "Dove" },
            { id: "swan", emoji: "🦢", label: "Swan" },
            { id: "unicorn", emoji: "🦄", label: "Unicorn" },
            { id: "penguin", emoji: "🐧", label: "Penguin" },
        ],
    },
];

// GET /stickers — return all sticker packs
stickerRouter.get("/stickers", (req, res) => {
    res.json({ success: true, packs: STICKER_PACKS });
});

module.exports = stickerRouter;
