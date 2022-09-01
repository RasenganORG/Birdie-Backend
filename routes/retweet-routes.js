const express = require("express")
const {
  addRetweet,
  getRetweets,
  getRetweetsByUserId,
  getRetweetsForHome,
  deleteRetweet,
  retweetTweet,
  unretweetTweet,
} = require("../controllers/retweetController")

const router = express.Router()

router.post("/retweets", addRetweet)
router.get("/retweets/:id", getRetweetsForHome)
router.get("/getRetweetsByUserId/:id", getRetweetsByUserId)
router.delete("/retweets", deleteRetweet)
router.put("/retweetTweet/:id", retweetTweet)
router.put("/unretweetTweet/:id", unretweetTweet)

module.exports = {
  routes: router,
}
