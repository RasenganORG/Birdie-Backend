const firebase = require("../db")
const Message = require("../models/message")
const firestore = firebase.firestore()

const addMessage = async (req, res, next) => {
  try {
    const data = req.body
    const messageRef = firestore.collection("messages").doc()
    const messageRefId = messageRef.id

    messageRef.set(data)
    res.send({ ...data, id: messageRefId })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getMessagesByChatId = async (req, res, next) => {
  try {
    const chatId = req.params.chatId
    const messages = firestore
      .collection("messages")
      .where("chatId", "==", chatId)
    const data = await messages.get()
    const messagesArray = []

    if (data.empty) {
    } else {
      data.forEach((doc) => {
        const message = new Message(
          doc.id,
          doc.data().chatId,
          doc.data().senderId,
          doc.data().text
        )
        messagesArray.push(message)
      })
    }
    res.send(messagesArray)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  addMessage,
  getMessagesByChatId,
}
