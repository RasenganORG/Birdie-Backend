const express = require("express")
const {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getLoggedUser,
  getUsersByUsername,
  getUserById,
  getUsersById,
  getFollowedUsers,
  getFollowers,
} = require("../controllers/userController")
const { routes } = require("./tweet-routes")

const router = express.Router()

router.post("/user", addUser)
router.get("/users", getAllUsers)
router.get("/user/:id", getUser)
router.put("/user/:id", updateUser)
router.delete("/user/:id", deleteUser)
router.get("/getLoggedUser/:email", getLoggedUser)
router.get("/usersbyusername", getUsersByUsername)
// router.get("/users/:id", getUserById)
router.get("/userById", getUserById)
router.get("/usersById", getUsersById)
// router.get("/following/:id", getFollowedUsers)
router.get("/following", getFollowedUsers)
routes.get("/followers", getFollowers)

module.exports = {
  routes: router,
}
