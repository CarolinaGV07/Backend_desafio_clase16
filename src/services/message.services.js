import MessageDto from "../DTO/messages.dto.js";

export default class MessageService {
  constructor(messageDAO) {
    this.messageDAO = messageDAO;
  }
  async saveMessage(data) {
    try {
      const message = await this.messageDAO.saveMessages(data);
      return new MessageDto(message);
    } catch (error) {
      throw error;
    }
  }
  async getMessages() {
    try {
      const messages = await this.messageDAO.getMessages();
      return messages;
    } catch (error) {
      throw error;
    }
  }
}
