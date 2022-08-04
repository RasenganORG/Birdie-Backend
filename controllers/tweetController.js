const firebase = require("../db")
const User = require("../models/user")
const Tweet = require("../models/tweet")
const firestore = firebase.firestore()

const addTweet = async (req, res, next) => {
  try {
    const data = req.body
    await firestore.collection("tweets").doc().set(data)
    res.send("Record saved successfuly")
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getAllTweets = async (req, res, next) => {
  try {
    const tweets = await firestore.collection("tweets")
    const data = await tweets.get()
    const tweetsArray = []
    if (data.empty) {
      res.status(404).send("No tweet record found")
    } else {
      data.forEach((doc) => {
        const tweet = new Tweet(
          doc.id,
          doc.data().userId,
          doc.data().text,
          doc.data().likes,
          doc.data().retweets,
          doc.data().replies
        )
        tweetsArray.push(tweet)
      })
      res.send(tweetsArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getTweet = async (req, res, next) => {
  try {
    const id = req.params.id
    const tweet = await firestore.collection("tweets").doc(id)
    const data = await tweet.get()
    if (!data.exists) {
      res.status(404).send("Tweet with the given ID not found")
    } else {
      res.send(data.data())
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const updateTweet = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = req.body
    const tweet = await firestore.collection("tweets").doc(id)
    await tweet.update(data)
    res.send("Tweet record updated successfuly")
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const deleteTweet = async (req, res, next) => {
  try {
    const id = req.params.id
    await firestore.collection("tweets").doc(id).delete()
    res.send("Record deleted successfuly")
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  addTweet,
  getAllTweets,
  getTweet,
  updateTweet,
  deleteTweet,
}
