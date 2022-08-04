const express = require("express")
const {
  getAllTweets,
  addTweet,
  getTweet,
  updateTweet,
  deleteTweet,
} = require("../controllers/tweetController")

const router = express.Router()
router.post("/tweet", addTweet)
router.get("/tweets", getAllTweets)
router.get("/tweet/:id", getTweet)
router.put("/tweet/:id", updateTweet)
router.delete("/tweet/:id", deleteTweet)

module.exports = {
  routes: router,
}
