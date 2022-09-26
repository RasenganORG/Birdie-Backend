const firebase = require("../db")
const Chat = require("../models/chat")
const User = require("../models/user")
const Message = require("../models/message")
const firestore = firebase.firestore()

const createChat = async (req, res, next) => {
  try {
    const data = req.body
    const users = data.users
    const createdBy = data.createdBy
    const users2 = [users[1], users[0]]
    const chatRef = firestore.collection("chats").doc()
    const chatRefId = chatRef.id
    const findChat = await firestore
      .collection("chats")
      .where("users", "==", users)
      .get()
    const findChat2 = await firestore
      .collection("chats")
      .where("users", "==", users2)
      .get()

    if (findChat.size === 0 && findChat2.size === 0) {
      chatRef.set(data)
      res.send({ ...data, id: chatRefId })
    }
    if (findChat.size > 0) {
      findChat.forEach((chat) => res.send({ ...data, id: chat.id }))
    } else if (findChat2.size > 0) {
      findChat2.forEach((chat) => res.send({ ...data, id: chat.id }))
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

// const getUserChats = async (req, res, next) => {
//   try {
//     const id = req.params.id
//     const chats = firestore
//       .collection("chats")
//       .where("users", "array-contains", id)
//     const data = await chats.get()
//     const chatsArray = []

//     if (data.empty) {
//       res.status(404).send("No retweet record found")
//     } else {
//       data.forEach((doc) => {
//         const chat = new Chat(doc.id, doc.data().users)
//         chatsArray.push(chat)
//       })
//       res.send(chatsArray)
//     }
//   } catch (error) {
//     res.status(400).send(error.message)
//   }
// }

const getUserChats = async (req, res, next) => {
  try {
    const id = req.params.id
    const chats = firestore
      .collection("chats")
      .where("users", "array-contains", id)
    const users = await firestore.collection("users").get()
    const messages = await firestore.collection("messages").get()
    const data = await chats.get()
    const chatsArray = []
    const usersArray = []
    const messagesArray = []

    if (data.empty) {
      res.send([])
      // res.send([])
    } else {
      users.forEach((doc) => {
        const user = new User(
          doc.id,
          doc.data().name,
          doc.data().username,
          doc.data().email,
          doc.data().password,
          doc.data().avatar,
          doc.data().bio,
          doc.data().background
        )
        usersArray.push(user)
      })

      messages.forEach((doc) => {
        const message = new Message(
          doc.id,
          doc.data().chatId,
          doc.data().senderId,
          doc.data().text,
          doc.data().createdAt
        )
        messagesArray.push(message)
      })

      data.forEach((doc) => {
        const userId =
          doc.data().users[0] === id ? doc.data().users[1] : doc.data().users[0]
        const userData = usersArray.find((user) => user.id === userId)
        const messagesChat = messagesArray.find(
          (message) => message.chatId === doc.id
        )
        console.log({ messagesChat })
        if (
          (messagesChat === undefined && id === doc.data().createdBy) ||
          messagesChat !== undefined
        ) {
          chatsArray.push({
            chatId: doc.id,
            userId: userId,
            ...userData,
          })
        }
      })
      res.send(chatsArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getChatById = async (req, res) => {
  try {
    const id = req.params.id
    const userId = req.params.userId
    const chat = firestore.collection("chats").doc(id)
    const data = await chat.get()
    const users = await firestore.collection("users").get()
    const usersArray = []
    if (!data.exists) {
      res.send([])
    } else {
      users.forEach((doc) => {
        const user = new User(
          doc.id,
          doc.data().name,
          doc.data().username,
          doc.data().email,
          doc.data().password,
          doc.data().avatar,
          doc.data().bio,
          doc.data().background
        )
        usersArray.push(user)
      })
      const uId =
        data.data().users[0] === userId
          ? data.data().users[1]
          : data.data().users[0]
      const userData = usersArray.find((user) => user.id === uId)
      res.send({
        chatId: id,
        userId: uId,
        ...userData,
        id: id,
      })
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const findChat = async (req, res) => {
  try {
    const { firstUserId, secondUserId } = req.params
    const chat = firestore
      .collection("chats")
      .where("users", "array-contains", firstUserId)
    const data = await chat.get()
    const chatsArray = []

    if (data.empty) {
      res.send([])
    } else {
      data.forEach((doc) => {
        if (
          doc.data().users[0] === secondUserId ||
          doc.data().users[1] === secondUserId
        ) {
          const chat = new Chat(doc.id, doc.data().users)
          chatsArray.push(chat)
        }
      })
      res.send(chatsArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  createChat,
  getUserChats,
  findChat,
  getChatById,
}
