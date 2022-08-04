const express = require("express")
const {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getLoggedUser,
} = require("../controllers/userController")

const router = express.Router()

router.post("/user", addUser)
router.get("/users", getAllUsers)
router.get("/user/:id", getUser)
router.put("/user/:id", updateUser)
router.delete("/user/:id", deleteUser)
router.get("/getLoggedUser/:email", getLoggedUser)
module.exports = {
  routes: router,
}
