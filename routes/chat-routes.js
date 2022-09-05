const express = require("express")
const {
  createChat,
  getUserChats,
  findChat,
  getChatById,
} = require("../controllers/chatController")

const router = express.Router()

router.post("/createChat", createChat)
router.get("/getUserChats/:id", getUserChats)
router.get("/find/:firstUserId/:secondUserId", findChat)
router.get("/getChatById/:id/:userId", getChatById)

module.exports = {
  routes: router,
}
