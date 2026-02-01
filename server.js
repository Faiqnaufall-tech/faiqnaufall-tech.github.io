import "dotenv/config";
import dns from "node:dns";
import express from "express";

// Paksa IPv4 agar tidak timeout saat akses Telegram API
dns.setDefaultResultOrder("ipv4first");

// Inisialisasi server Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware dasar: file statis + body parser
app.use(express.static("."));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Endpoint feedback untuk kirim pesan ke Telegram
app.post("/api/feedback", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim();
  const message = String(req.body.message || "").trim();

  // Validasi input
  if (!name || !email || !message) {
    return res.status(400).send("Semua field wajib diisi.");
  }

  try {
    // Ambil konfigurasi bot Telegram dari env
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return res.status(500).send("Telegram belum dikonfigurasi.");
    }

    // Format isi pesan Telegram
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

// Jalankan server lokal
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
