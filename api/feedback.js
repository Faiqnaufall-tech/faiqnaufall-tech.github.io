// Handler serverless untuk feedback (Vercel)
export default async function handler(req, res) {
  // Hanya terima POST
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Ambil data dari body
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();

  // Validasi input
  if (!name || !email || !message) {
    return res.status(400).send("Semua field wajib diisi.");
  }

  // Ambil konfigurasi Telegram dari env
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).send("Telegram belum dikonfigurasi.");
  }

  // Format pesan
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
      return res.status(500).send("Gagal mengirim feedback.");
    }

    return res.status(200).send("Feedback terkirim.");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Gagal mengirim feedback.");
  }
}
