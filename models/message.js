class Message {
  constructor(id, chatId, senderId, text, createdAt) {
    this.id = id
    this.chatId = chatId
    this.senderId = senderId
    this.text = text
    this.createdAt = createdAt
  }
}

module.exports = Message
