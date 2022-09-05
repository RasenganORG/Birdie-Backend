const express = require("express")
const {
  addMessage,
  getMessagesByChatId,
} = require("../controllers/messageController")

const router = express.Router()

router.post("/addMessage", addMessage)
router.get("/getMessagesByChatId/:chatId", getMessagesByChatId)

module.exports = {
  routes: router,
}
