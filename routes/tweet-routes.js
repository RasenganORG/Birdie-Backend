const express = require("express")
const {
  getAllTweets,
  addTweet,
  getTweet,
  getReplies,
  updateTweet,
  deleteTweet,
} = require("../controllers/tweetController")

const router = express.Router()
router.post("/tweets", addTweet)
router.get("/tweets", getAllTweets)
router.get("/tweets/:id", getReplies)
router.get("/tweet/:id", getTweet)
router.put("/tweet/:id", updateTweet)
router.delete("/tweet/:id", deleteTweet)

module.exports = {
  routes: router,
}
