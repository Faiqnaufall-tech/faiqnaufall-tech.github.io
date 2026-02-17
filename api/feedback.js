export default async function handler(req, res) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

  const origin = req.headers.origin || "";
  if (allowedOrigins.length) {
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method not allowed.");
    return;
  }

  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !message) {
    res.status(400).send("Semua field wajib diisi.");
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    res.status(500).send("Telegram belum dikonfigurasi.");
    return;
  }

  const text = [
    "📩 Feedback Baru",
    `Nama: ${name}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(errText);
      res.status(500).send("Gagal mengirim feedback.");
      return;
    }

    res.status(200).send("Feedback terkirim.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal mengirim feedback.");
  }
}
