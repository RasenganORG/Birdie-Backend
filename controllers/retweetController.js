const firebase = require("../db")
const Retweet = require("../models/retweet")
const Tweet = require("../models/tweet")
const User = require("../models/user")
const Like = require("../models/like")
const Follow = require("../models/follow")
const firestore = firebase.firestore()
const { FieldValue } = require("firebase-admin/firestore")

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
    const createdAt = FieldValue.serverTimestamp()
    retweetRef.set({ ...data, createdAt: createdAt })
    res.send({ ...data, id: retweetRefId })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const retweetTweet = async (req, res, next) => {
  try {
    const id = req.params.id
    const tweet = await firestore.collection("tweets").doc(id)
    console.log("UPDATED")

    await tweet.update({ retweets: FieldValue.increment(1) })
    const newData = await tweet.get()

    res.send({ ...newData.data(), id })
  } catch {}
}

const unretweetTweet = async (req, res, next) => {
  try {
    const id = req.params.id
    const tweet = await firestore.collection("tweets").doc(id)
    console.log("UPDATED")

    await tweet.update({ retweets: FieldValue.increment(-1) })
    const newData = await tweet.get()

    res.send({ ...newData.data(), id })
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
      res.send([])
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
      .orderBy("createdAt", "desc")
    const data = await retweets.get()
    const tweets = await firestore.collection("tweets").get()
    const usersArray = await getUsersArray()
    const tweetLikes = await firestore
      .collection("likes")
      .where("userId", "==", id)
      .get()
    const tweetsArray = []
    const retweetsArray = []
    const retweetsCollectionArray = []
    const likesCollectionArray = []
    if (data.empty) {
      res.send([])
    } else {
      tweets.forEach((doc) => {
        const tweet = new Tweet(
          doc.id,
          doc.data().parentId,
          doc.data().userId,
          doc.data().text,
          doc.data().likes,
          doc.data().retweets,
          doc.data().createdAt.seconds,
          doc.data().url
        )
        tweetsArray.push(tweet)
      })

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

      data.forEach((doc) => {
        const retweet = new Retweet(
          doc.id,
          doc.data().userId,
          doc.data().retweetedTweetId
        )
        retweetsCollectionArray.push(retweet)
      })

      data.forEach((doc) => {
        const tweet = tweetsArray.find(
          (t) => t.id === doc.data().retweetedTweetId
        )
        console.log(doc.data())

        const user = usersArray.find((u) => id === u.id)

        const userData = usersArray.find((u) => u.id === tweet.userId)

        let isLiked = likesCollectionArray.find(
          (like) => like.likedTweetId === tweet.id
        ) // find out if the user has liked this tweet

        console.log({ isLiked })
        if (isLiked === undefined) {
          isLiked = false
        } else {
          isLiked = true
        }

        retweetsArray.push({
          ...tweet,
          ...userData,
          id: tweet.id,
          isRetweetedByHomeUser: true,
          isLiked: isLiked,
          isRetweet: true,
          retweetedUsername: user.username,
        })
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
    const retweets = firestore
      .collection("retweets")
      .orderBy("createdAt", "desc")
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
    const retweetsCollectionArray = []

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

    data.forEach((doc) => {
      if (doc.data().userId === id) {
        const retweet = new Retweet(
          doc.id,
          doc.data().userId,
          doc.data().retweetedTweetId
        )
        retweetsCollectionArray.push(retweet)
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
        doc.data().createdAt.seconds,
        doc.data().url
      )
      tweetsArray.push(tweet)
    })

    if (data.empty) {
      res.send([])
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

        const retweetUser = usersArray.find((u) => u.id === doc.data().userId)

        if (
          followed &&
          tweet.parentId === null // if the user is in my followed list and is not a reply
          // or if the user is me and is not a reply
        ) {
          const user = usersArray.find((u) => tweet.userId === u.id) // get the fields of that user
          console.log("doc.id", doc.id)

          let isLiked = likesCollectionArray.find(
            (like) => like.likedTweetId === tweet.id
          ) // find out if the user has liked this tweet

          if (isLiked === undefined) {
            isLiked = false
          } else {
            isLiked = true
          }

          let isRetweetedByHomeUser = retweetsCollectionArray.find(
            (retweet) => retweet.retweetedTweetId === tweet.id
          )
          if (isRetweetedByHomeUser === undefined) {
            isRetweetedByHomeUser = false
          } else {
            isRetweetedByHomeUser = true
          }

          const newTweet = {
            ...tweet,
            ...user,
            id: tweet.id,
            isRetweet: true,
            retweetedUsername: retweetUser.username,
            isLiked: isLiked,
            isRetweetedByHomeUser: isRetweetedByHomeUser,
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

const del = async (id) => {
  try {
    await firestore.collection("retweets").doc(id).delete()

    console.log("Record deleted successfuly")
  } catch (error) {
    console.log(error.message)
  }
}

const deleteRetweet = async (req, res, next) => {
  try {
    const data = req.body.data
    console.log(data)
    const retweet = await firestore
      .collection("retweets")
      .where("userId", "==", data.userId)
      .where("retweetedTweetId", "==", data.retweetedTweetId)
      .get()
    let id = null

    retweet.forEach((doc) => {
      del(doc.id)
      id = doc.id
    })

    res.send({ ...data, id })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  addRetweet,
  getRetweets,
  getRetweetsByUserId,
  getRetweetsForHome,
  deleteRetweet,
  retweetTweet,
  unretweetTweet,
}
