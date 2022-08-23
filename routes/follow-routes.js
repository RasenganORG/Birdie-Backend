const express = require("express")
const {
  addFollow,
  getAllFollows,
  deleteFollow,
  getFollowedUsers,
  getFollowers,
} = require("../controllers/followController")

const router = express.Router()

router.post("/follows", addFollow)
router.delete("/unfollow", deleteFollow)
router.get("/follows", getAllFollows)
router.delete("/follow/:id", deleteFollow)

module.exports = {
  routes: router,
}
