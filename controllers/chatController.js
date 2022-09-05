const firebase = require("../db")
const Chat = require("../models/chat")
const User = require("../models/user")
const firestore = firebase.firestore()

const createChat = async (req, res, next) => {
  try {
    const data = req.body
    const chatRef = firestore.collection("chats").doc()
    const chatRefId = chatRef.id

    chatRef.set(data)
    res.send({ ...data, id: chatRefId })
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
    const data = await chats.get()
    const chatsArray = []
    const usersArray = []

    if (data.empty) {
      res.status(404).send("No retweet record found")
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
      data.forEach((doc) => {
        const userId =
          doc.data().users[0] === id ? doc.data().users[1] : doc.data().users[0]
        const userData = usersArray.find((user) => user.id === userId)
        chatsArray.push({
          chatId: doc.id,
          userId: userId,
          ...userData,
        })
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
      res.status(404).send("No chat record found")
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
      res.status(404).send("No chat record found")
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
