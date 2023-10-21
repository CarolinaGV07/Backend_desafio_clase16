import { messageService } from "../services/index.js";

export const getMessages = async (req, res) => {
  try {
    const messages = await messageService.getMessages();
    res.status(200).render("chat", { messages, css:"chat" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const saveMessage = async (req, res) => {
  try {
    const message = await messageService.saveMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
