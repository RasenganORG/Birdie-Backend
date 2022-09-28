const express = require("express")
const { uploadMedia, getMedia } = require("../controllers/cloudinaryController")

const router = express.Router()

router.post("/upload", uploadMedia)
router.get("/getMedia", getMedia)

module.exports = {
  routes: router,
}
