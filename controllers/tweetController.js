const firebase = require("../db")
const Tweet = require("../models/tweet")
const firestore = firebase.firestore()
const { FieldValue } = require("firebase-admin/firestore")

const addTweet = async (req, res, next) => {
  try {
    const data = req.body
    const tweetRef = await firestore.collection("tweets").doc()
    const tweetRefId = tweetRef.id
    tweetRef.set(data)
    res.send({ ...data, id: tweetRefId })
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
          doc.data().parentId,
          doc.data().userId,
          doc.data().text,
          doc.data().likes,
          doc.data().retweets
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
      res.send({ ...data.data(), id })
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getReplies = async (req, res, next) => {
  try {
    const id = req.params.id
    const tweets = await firestore.collection("tweets")
    const data = await tweets.get()
    const repliesArray = []
    if (data.empty) {
      res.status(404).send("No tweet found")
    } else {
      data.forEach((doc) => {
        if (doc.data().parentId === id) {
          const tweet = new Tweet(
            doc.id,
            doc.data().parentId,
            doc.data().userId,
            doc.data().text,
            doc.data().likes,
            doc.data().retweets
          )
          repliesArray.push(tweet)
        }
      })
      res.send(repliesArray)
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
    console.log("UPDATED")

    await tweet.update({
      replies: FieldValue.arrayUnion(data.addedTweetId),
    })
    const newData = await tweet.get()

    res.send({ ...newData.data(), id })
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
  getReplies,
  updateTweet,
  deleteTweet,
}
