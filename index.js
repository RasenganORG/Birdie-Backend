"use strict"
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const config = require("./config")
const userRoutes = require("./routes/user-routes")
const tweetRoutes = require("./routes/tweet-routes")
const followRoutes = require("./routes/follow-routes")
const likeRoutes = require("./routes/like-routes")
const retweetRoutes = require("./routes/retweet-routes")
const chatRoutes = require("./routes/chat-routes")
const messageRoutes = require("./routes/message-routes")
const cloudinaryRoutes = require("./routes/cloudinary-routes")
const app = express()
const cloudinary = require("cloudinary").v2

app.use(express.json({ limit: "50mb" }))
app.use(cors())
app.use(bodyParser.json())

// if (typeof config.cloudinaryConfig.cloudName === "undefined") {
//   console.warn("!! cloudinary config is undefined !!")
//   console.warn("export CLOUDINARY_URL or set dotenv file")
// } else {
//   cloudinary.config({
//     cloud_name: config.cloudinaryConfig.cloudName,
//     api_key: config.cloudinaryConfig.apiKey,
//     api_secret: config.cloudinaryConfig.apiSecret,
//   })
//   // console.log("cloudinary config:")
//   // console.log(cloudinary.config())
// }

app.use("/api", userRoutes.routes)
app.use("/api", tweetRoutes.routes)
app.use("/api", followRoutes.routes)
app.use("/api", likeRoutes.routes)
app.use("/api", retweetRoutes.routes)
app.use("/api", chatRoutes.routes)
app.use("/api", messageRoutes.routes)
app.use("/api", cloudinaryRoutes.routes)

app.listen(config.port, () =>
  console.log("App is listening on url http://localhost:" + config.port)
)
