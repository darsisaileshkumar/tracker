const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ==============================
// MongoDB Connection
// ==============================
mongoose.connect("mongodb://127.0.0.1:27017/weekly_tracker")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// ==============================
// Schema (Sleep Tracker)
// ==============================
const sleepSchema = new mongoose.Schema({
  habit: { type: String, required: true },
  date: { type: String, required: true },
  done: { type: Boolean, required: true }
});

// prevent duplicate habit+date
sleepSchema.index({ habit: 1, date: 1 }, { unique: true });

const Sleep = mongoose.model("Sleep", sleepSchema);

// ==============================
// Save / Update Entry
// ==============================
app.post("/entry", async (req, res) => {
  try {
    const { habit, date, done } = req.body;

    const entry = await Sleep.findOneAndUpdate(
      { habit, date },
      { habit, date, done },
      { upsert: true, new: true }
    );

    res.json(entry);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ==============================
// Get All Entries
// ==============================
app.get("/entries", async (req, res) => {
  const entries = await Sleep.find().sort({ date: 1 });
  res.json(entries);
});

// ==============================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});