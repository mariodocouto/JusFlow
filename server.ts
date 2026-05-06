import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";

// Configurações do WhatsApp (Preferencialmente via Env)
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "EAANyytfxNvwBRSeXe1CIoujxQ9WJDAp7EES0glZCaB4OgBnGc6VhINUxvlLuySZAaClo7mUdY5KQRhmRvQeZBDz0Abf49KUO3ziVmHAeFVZAIgdarNRW50o3eapRNL1oC6jfntEwwfa3bNlcK0WBxXXotoXhdJZAZCZA594szuz5ZCaY3SmyK3GkCsHUIarBznNj5bsqVy4tJSte7bRU0GYTqfSMqE1hF3v1NF9FGHtfwN3nZA68KGyfGCSMJbTSZCv3Je8cKnk7maLvxciQFiAGz3x7Q7vWRlKoXnlWAZD";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "1037735152765682";
const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "jusflow_secret_token_123";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json());

  // --- WEBHOOK WHATSAPP (VALIDAÇÃO) ---
  app.get("/webhook", (req, res) => {
    console.log("Recebida tentativa de validação de Webhook:", req.query);
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED com sucesso!");
      res.status(200).send(challenge);
    } else {
      console.warn("Falha na verificação do token do Webhook. Recebido:", token, "Esperado:", VERIFY_TOKEN);
      res.sendStatus(403);
    }
  });

  // --- WEBHOOK WHATSAPP (RECEBIMENTO DE MENSAGENS) ---
  app.post("/webhook", (req, res) => {
    const body = req.body;

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // Número do cliente
        const text = message.text.body;

        console.log(`Mensagem recebida de ${from}: ${text}`);
        
        // No futuro: Integrar com Firestore aqui via Admin SDK ou Proxy
        // Por enquanto, logamos no servidor.
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });

  // --- API PARA ENVIAR MENSAGENS ---
  app.post("/api/whatsapp/send", async (req, res) => {
    const { to, message } = req.body;

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      res.json(response.data);
    } catch (error: any) {
      console.error("Erro ao enviar WhatsApp:", error.response?.data || error.message);
      res.status(500).json({ error: "Falha ao enviar mensagem" });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor JusFlow rodando em http://localhost:${PORT}`);
    console.log(`WEBHOOK URL: ${process.env.APP_URL}/webhook`);
  });
}

startServer();
