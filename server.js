import "dotenv/config";
import dns from "node:dns";
import express from "express";

// Force IPv4 first to avoid IPv6 timeout issues to Telegram API
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("."));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/api/feedback", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim();
  const message = String(req.body.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).send("Semua field wajib diisi.");
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return res.status(500).send("Telegram belum dikonfigurasi.");
    }

    const text = [
      "📩 Feedback Baru",
      `Nama: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(errText);
      return res.status(500).send("Gagal mengirim feedback.");
    }

    res.status(200).send("Feedback terkirim.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal mengirim feedback.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
