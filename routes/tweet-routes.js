const express = require("express")
const {
  getAllTweets,
  addTweet,
  getTweet,
  getReplies,
  likeTweet,
  dislikeTweet,
  deleteTweet,
  getTweetsByUserId,
  getTweetsForHome,
  addRetweet,
} = require("../controllers/tweetController")

const router = express.Router()
router.post("/tweets", addTweet)
router.get("/tweets", getAllTweets)
router.get("/tweets/:id", getReplies)
router.get("/tweet/:id/:userId", getTweet)
router.put("/likeTweet/:id", likeTweet)
router.put("/dislikeTweet/:id", dislikeTweet)
router.delete("/tweet/:id", deleteTweet)
router.get("/tweetsByUserId/:id", getTweetsByUserId)
router.get("/tweetsForHome/:id", getTweetsForHome)
router.post("/addRetweet", addRetweet)

module.exports = {
  routes: router,
}
