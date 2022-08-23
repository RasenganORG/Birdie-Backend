const express = require("express")
const {
  addRetweet,
  getRetweets,
  getRetweetsByUserId,
  getRetweetsForHome,
} = require("../controllers/retweetController")

const router = express.Router()

router.post("/retweets", addRetweet)
router.get("/retweets/:id", getRetweetsForHome)
router.get("/getRetweetsByUserId/:id", getRetweetsByUserId)

module.exports = {
  routes: router,
}
