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

const app = express()

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())

app.use("/api", userRoutes.routes)
app.use("/api", tweetRoutes.routes)
app.use("/api", followRoutes.routes)
app.use("/api", likeRoutes.routes)
app.use("/api", retweetRoutes.routes)

app.listen(config.port, () =>
  console.log("App is listening on url http://localhost:" + config.port)
)
