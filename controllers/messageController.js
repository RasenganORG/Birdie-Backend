const firebase = require("../db")
const Message = require("../models/message")
const { FieldValue, Timestamp } = require("firebase-admin/firestore")
const firestore = firebase.firestore()

const addMessage = async (req, res, next) => {
  try {
    const data = req.body
    const messageRef = firestore.collection("messages").doc()
    const messageRefId = messageRef.id
    const createdAt = FieldValue.serverTimestamp()
    // const date = new Date(createdAt.seconds * 1000).toUTCString()

    messageRef.set({ ...data, createdAt })
    const timeNow = Timestamp.now()
    console.log("TIME", timeNow)

    res.send({ ...data, id: messageRefId, createdAt: timeNow.seconds })
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
      .orderBy("createdAt")
    const data = await messages.get()
    const messagesArray = []

    if (data.empty) {
    } else {
      data.forEach((doc) => {
        // const date = new Date(doc.data().createdAt.seconds * 1000).toUTCString()
        const message = new Message(
          doc.id,
          doc.data().chatId,
          doc.data().senderId,
          doc.data().text,
          doc.data().createdAt.seconds
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
