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
router.get("/follows", getAllFollows)
router.delete("/follow/:id", deleteFollow)
// router.get("/following/:id", getFollowedUsers)
// router.get("/followers/:id", getFollowers)
module.exports = {
  routes: router,
}
