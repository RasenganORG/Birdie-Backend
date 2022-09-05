class Message {
  constructor(id, chatId, senderId, text) {
    this.id = id
    this.chatId = chatId
    this.senderId = senderId
    this.text = text
  }
}

module.exports = Message
