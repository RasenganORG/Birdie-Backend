const firebase = require("../db")
const Retweet = require("../models/retweet")
const Tweet = require("../models/tweet")
const User = require("../models/user")
const Like = require("../models/like")
const Follow = require("../models/follow")
const firestore = firebase.firestore()

const getUsersArray = async () => {
  const users = await firestore.collection("users")
  const dataUsers = await users.get()
  const usersArray = []
  dataUsers.forEach((doc) => {
    const user = new User(
      doc.id,
      doc.data().name,
      doc.data().username,
      doc.data().email,
      doc.data().password,
      doc.data().avatar
    )
    usersArray.push(user)
  })
  return usersArray
}

const addRetweet = async (req, res, next) => {
  try {
    const data = req.body
    const retweetRef = await firestore.collection("retweets").doc()
    const retweetRefId = retweetRef.id
    retweetRef.set(data)
    res.send({ ...data, id: retweetRefId })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getRetweets = async (req, res, next) => {
  try {
    const retweets = await firestore.collection("retweets")
    const data = await retweets.get()
    const retweetsArray = []
    if (data.empty) {
      res.status(404).send("No retweet record found")
    } else {
      data.forEach((doc) => {
        const retweet = new Retweet(
          doc.id,
          doc.data().userId,
          doc.data().retweetedTweetId
        )
        retweetsArray.push(retweet)
      })
      res.send(retweetsArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getRetweetsByUserId = async (req, res) => {
  try {
    const id = req.params.id
    const retweets = await firestore
      .collection("retweets")
      .where("userId", "==", id)
    const data = await retweets.get()
    const tweets = await firestore.collection("tweets").get()
    const usersArray = await getUsersArray()
    const tweetsArray = []
    const retweetsArray = []
    if (data.empty) {
      res.status(404).send("No retweet record found")
    } else {
      tweets.forEach((doc) => {
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

      data.forEach((doc) => {
        const tweet = tweetsArray.find(
          (t) => t.id === doc.data().retweetedTweetId
        )
        const user = usersArray.find((u) => tweet.userId === u.id)

        const retweet = new Retweet(
          doc.id,
          doc.data().userId,
          doc.data().retweetedTweetId
        )
        retweetsArray.push({ ...tweet, ...user })
      })
      res.send(retweetsArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getRetweetsForHome = async (req, res) => {
  try {
    const id = req.params.id
    // get all retweets
    const retweets = await firestore.collection("retweets")
    const data = await retweets.get()
    // get all tweets
    const tweets = await firestore.collection("tweets").get()
    const tweetsArray = []
    const retweetsArray = []
    // get all users
    const usersArray = await getUsersArray()
    // get all follows
    const follows = await firestore.collection("follows")
    const followsCollection = await follows.get()
    const followedUsersArray = []
    const tweetLikes = await firestore
      .collection("likes")
      .where("userId", "==", id)
      .get()
    const likesCollectionArray = []

    tweetLikes.forEach((doc) => {
      if (doc.data().userId === id) {
        const like = new Like(
          doc.id,
          doc.data().userId,
          doc.data().likedTweetId
        )
        likesCollectionArray.push(like)
      }
    })

    // get all users that the user follows
    followsCollection.forEach((doc) => {
      if (doc.data().userId === id) {
        const follow = new Follow(
          doc.id,
          doc.data().userId,
          doc.data().followedUserId
        )
        followedUsersArray.push(follow)
      }
    })

    // get all tweets data
    tweets.forEach((doc) => {
      const tweet = new Tweet(
        doc.id,
        doc.data().parentId,
        doc.data().userId,
        doc.data().text,
        doc.data().likes,
        doc.data().retweets,
        doc.data().retweetedUserId
      )
      tweetsArray.push(tweet)
    })

    if (data.empty) {
      res.status(404).send("No retweet record found")
    } else {
      data.forEach(async (doc) => {
        // get the retweet's tweet
        const tweet = tweetsArray.find(
          (t) => t.id === doc.data().retweetedTweetId
        )
        // find out if user is following the user
        const followed = followedUsersArray.find(
          (f) => doc.data().userId === f.followedUserId
        )

        console.log({ tweet })
        console.log("userid" + doc.data().userId + " is followed " + followed)
        if (
          followed &&
          tweet.parentId === null // if the user is in my followed list and is not a reply
          // or if the user is me and is not a reply
        ) {
          const user = usersArray.find((u) => tweet.userId === u.id) // get the fields of that user
          console.log("doc.id", doc.id)

          const t = new Tweet(
            doc.id,
            doc.data().parentId,
            doc.data().userId,
            doc.data().text,
            doc.data().likes,
            doc.data().retweets
          )

          let isLiked = likesCollectionArray.find(
            (like) => like.likedTweetId === doc.id
          ) // find out if the user has liked this tweet

          if (isLiked === undefined) {
            isLiked = false
          } else {
            isLiked = true
          }

          const newTweet = {
            ...tweet,
            ...user,
            id: doc.id,
            isRetweet: true,
            retweetedUsername: doc.data().userId,
            isLiked: isLiked,
          }
          retweetsArray.push(newTweet)
        }
      })
      res.send(retweetsArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  addRetweet,
  getRetweets,
  getRetweetsByUserId,
  getRetweetsForHome,
}
