const firebase = require("../db")
const Tweet = require("../models/tweet")
const User = require("../models/user")
const Follow = require("../models/follow")
const Retweet = require("../models/retweet")
const Like = require("../models/like")
const firestore = firebase.firestore()
const cloudinary = require("cloudinary").v2
const { FieldValue, Timestamp } = require("firebase-admin/firestore")
const config = require("../config")

cloudinary.config({
  cloud_name: config.cloudinaryConfig.cloudName,
  api_key: config.cloudinaryConfig.apiKey,
  api_secret: config.cloudinaryConfig.apiSecret,
})

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

const getTweetsForHome = async (req, res, next) => {
  try {
    const id = req.params.id // id of the user
    const tweets = await firestore
      .collection("tweets")
      .orderBy("createdAt", "desc")
    const data = await tweets.get()
    const retweets = await firestore.collection("retweets").get()
    const retweetsCollectionArray = []
    const tweetsArray = []
    const usersArray = await getUsersArray()
    const follows = await firestore.collection("follows")
    const followsCollection = await follows.get()
    const tweetLikes = await firestore
      .collection("likes")
      .where("userId", "==", id)
      .get() // get all likes of user
    const followedUsersArray = []
    const likesCollectionArray = []

    retweets.forEach((doc) => {
      if (doc.data().userId === id) {
        const retweet = new Retweet(
          doc.id,
          doc.data().userId,
          doc.data().retweetedTweetId,
          doc.data().createdAt
        )
        retweetsCollectionArray.push(retweet)
      }
    })

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

    if (data.empty) {
      res.send([])
    } else {
      data.forEach(async (doc) => {
        const followed = followedUsersArray.find(
          (f) => doc.data().userId === f.followedUserId
        )
        if (
          followed &&
          doc.data().parentId === null
          // if the user is in my followed list and is not a reply
          // (doc.data().userId === id && doc.data().parentId === null) // or if the user is me and is not a reply
        ) {
          const user = usersArray.find((u) => doc.data().userId === u.id) // get the fields of that user
          console.log("doc.id", doc.id)
          let isLiked = likesCollectionArray.find(
            (like) => like.likedTweetId === doc.id
          ) // find out if the user has liked this tweet

          console.log({ isLiked })
          if (isLiked === undefined) {
            isLiked = false
          } else {
            isLiked = true
          }

          let isRetweetedByHomeUser = retweetsCollectionArray.find(
            (retweet) => retweet.retweetedTweetId === doc.id
          )
          if (isRetweetedByHomeUser === undefined) {
            isRetweetedByHomeUser = false
          } else {
            isRetweetedByHomeUser = true
          }

          const tweet = new Tweet(
            doc.id,
            doc.data().parentId,
            doc.data().userId,
            doc.data().text,
            doc.data().likes,
            doc.data().retweets,
            // doc.data().retweetedUserId,
            doc.data().createdAt.seconds,
            doc.data().url
          )

          const newTweet = {
            ...tweet,
            ...user,
            id: doc.id,
            isLiked: isLiked,
            isRetweetedByHomeUser: isRetweetedByHomeUser,
            isRetweet: false,
          }
          tweetsArray.push(newTweet)
        }
      })
      res.send(tweetsArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const upload = async (image) => {
  try {
    const options = {
      use_filename: false,
      unique_filename: true,
      overwrite: true,
      resource_type: "auto",
    }
    console.log({ image })
    const result = await cloudinary.uploader.upload(image, options)
    console.log({ result })
    console.log("result.secure_url", result.secure_url)
    return result.secure_url
  } catch (error) {
    console.log(error.message)
  }
}

const addTweet = async (req, res, next) => {
  try {
    const data = req.body
    console.log({ data })
    const usersArray = await getUsersArray()
    const tweetRef = firestore.collection("tweets").doc()
    const tweetRefId = tweetRef.id
    const createdAt = FieldValue.serverTimestamp()

    let imageUrl = []

    for (const file of data.url) {
      const newPath = await upload(file)
      imageUrl.push(newPath)
    }

    console.log({ imageUrl })

    tweetRef.set({ ...data.tweetData, createdAt: createdAt, url: imageUrl })
    const user = usersArray.find((u) => data.tweetData.userId === u.id)
    const timeNow = Timestamp.now()

    res.send({
      ...data.tweetData,
      ...user,
      url: imageUrl,
      id: tweetRefId,
      isLiked: false,
      isRetweetedByHomeUser: false,
      createdAt: timeNow.seconds,
    })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getAllTweets = async (req, res, next) => {
  try {
    const tweets = await firestore.collection("tweets")
    const data = await tweets.get()
    const usersArray = await getUsersArray()
    const tweetsArray = []

    if (data.empty) {
      res.send([])
    } else {
      data.forEach(async (doc) => {
        const user = usersArray.find((u) => doc.data().userId === u.id)
        const tweet = new Tweet(
          doc.id,
          doc.data().parentId,
          doc.data().userId,
          doc.data().text,
          doc.data().likes,
          doc.data().retweets,
          doc.data().retweetedUserId,
          doc.data().createdAt,
          doc.data().url
        )
        const newTweet = { ...tweet, ...user, id: doc.id }
        tweetsArray.push(newTweet)
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
    const userId = req.params.userId
    const usersArray = await getUsersArray()
    const tweet = await firestore.collection("tweets").doc(id)
    const data = await tweet.get()
    const tweetLikes = await firestore
      .collection("likes")
      .where("userId", "==", userId)
      .get()
    console.log("userId likes:" + userId)
    const likesCollectionArray = []

    tweetLikes.forEach((doc) => {
      const like = new Like(doc.id, doc.data().userId, doc.data().likedTweetId)
      likesCollectionArray.push(like)
    })

    let isLiked = likesCollectionArray.find((like) => like.likedTweetId === id)

    if (isLiked === undefined) {
      isLiked = false
    } else {
      isLiked = true
    }

    const user = usersArray.find((u) => data.data().userId === u.id)

    if (!data.exists) {
      res.send([])
    } else {
      res.send({
        ...data.data(),
        createdAt: data.data().createdAt.seconds,
        ...user,
        id,
        isLiked: isLiked,
      })
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getTweetsByUserId = async (req, res, next) => {
  try {
    const id = req.params.id
    const user = firestore.collection("users").doc(id)
    const userData = await user.get()
    const tweets = firestore.collection("tweets").orderBy("createdAt", "desc")
    const data = await tweets.get()
    const tweetLikes = await firestore
      .collection("likes")
      .where("userId", "==", id)
      .get()
    const retweets = await firestore
      .collection("retweets")
      .where("userId", "==", id)
      .get()
    const tweetsArray = []
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

    retweets.forEach((doc) => {
      if (doc.data().userId === id) {
        const retweet = new Retweet(
          doc.id,
          doc.data().userId,
          doc.data().retweetedTweetId
        )
        retweetsCollectionArray.push(retweet)
      }
    })

    if (data.empty) {
      res.send([])
    } else {
      data.forEach((doc) => {
        if (
          (doc.data().userId === id && doc.data().parentId === null) ||
          doc.data().retweetedUserId === id
        ) {
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

          let isLiked = likesCollectionArray.find(
            (like) => like.likedTweetId === doc.id
          )
          if (isLiked === undefined) {
            isLiked = false
          } else {
            isLiked = true
          }

          let isRetweetedByHomeUser = retweetsCollectionArray.find(
            (retweet) => retweet.retweetedTweetId === doc.id
          )
          if (isRetweetedByHomeUser === undefined) {
            isRetweetedByHomeUser = false
          } else {
            isRetweetedByHomeUser = true
          }

          tweetsArray.push({
            ...tweet,
            ...userData.data(),
            id: doc.id,
            isLiked: isLiked,
            isRetweetedByHomeUser: isRetweetedByHomeUser,
          })
        }
      })
      res.send(tweetsArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getReplies = async (req, res, next) => {
  try {
    const id = req.params.id
    const tweets = firestore.collection("tweets").orderBy("createdAt")
    const data = await tweets.get()
    const usersArray = await getUsersArray()
    const repliesArray = []
    const tweetLikes = await firestore
      .collection("likes")
      .where("userId", "==", id)
      .get()
    if (data.empty) {
      res.send([])
    } else {
      const likesCollectionArray = []
      tweetLikes.forEach((doc) => {
        const like = new Like(
          doc.id,
          doc.data().userId,
          doc.data().likedTweetId
        )
        likesCollectionArray.push(like)
      })

      let isLiked = likesCollectionArray.find(
        (like) => like.likedTweetId === doc.id
      )
      if (isLiked === undefined) {
        isLiked = false
      } else {
        isLiked = true
      }

      data.forEach((doc) => {
        if (doc.data().parentId === id) {
          const tweet = new Tweet(
            doc.id,
            doc.data().parentId,
            doc.data().userId,
            doc.data().text,
            doc.data().likes,
            doc.data().retweets,
            // doc.data().retweetedUserId,
            doc.data().createdAt.seconds,
            doc.data().url
          )
          const user = usersArray.find((u) => doc.data().userId === u.id)

          repliesArray.push({ ...tweet, ...user, id: doc.id, isLiked: isLiked })
        }
      })
      res.send(repliesArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const likeTweet = async (req, res, next) => {
  try {
    const id = req.params.id
    const tweet = await firestore.collection("tweets").doc(id)
    console.log("UPDATED")

    await tweet.update({ likes: FieldValue.increment(1) })
    const newData = await tweet.get()

    res.send({ ...newData.data(), id })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const dislikeTweet = async (req, res, next) => {
  try {
    const id = req.params.id
    const tweet = await firestore.collection("tweets").doc(id)
    console.log("UPDATED")

    await tweet.update({ likes: FieldValue.increment(-1), liked: false })
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

const addRetweet = async (req, res, next) => {
  try {
    const data = req.body
    const usersArray = await getUsersArray()
    const originalTweet = await firestore
      .collection("tweets")
      .doc(data.originalTweetId)
      .get()

    console.log("original tweet", originalTweet.data())
    const tweetRef = await firestore.collection("tweets").doc()
    const tweetRefId = tweetRef.id
    tweetRef.set({
      ...originalTweet.data(),
      retweetedUserId: data.retweetedUserId,
    })
    // const originalUser = usersArray.find((u) => originalTweet.userId === u.id)
    // const retweetedUser = usersArray.find((u) => data.retweetedUserId === u.id)

    res.send({
      ...data,
      ...user,
      id: tweetRefId,
      originalTweetId: originalTweet.id,
    })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

// const getRetweetsByUserId = async (req, res, next) => {
//   try {
//     const id = req.params.id
//     const usersArray = await getUsersArray()
//     const user = usersArray.find((u) => id === u.id)
//     const retweetsOfUser = await firestore
//       .collection("tweets")
//       .where("userId", "==", id)
//       .get()

//     retweetsOfUserArray = []

//     retweetsOfUser.forEach((doc) => {
//       if (doc.data().retweetedUserId !== null) {
//         const tweet = new Tweet(
//           doc.data().id,
//           doc.data().parentId,
//           doc.data().user,
//           doc.data().text,
//           doc.data().likes,
//           doc.data().retweets,
//           doc.data().retweetedUserId
//         )
//         retweetsOfUserArray.push(tweet)
//       }
//     })
//     res.send({ retweetsOfUserArray })
//   } catch (error) {
//     res.status(400).send(error.message)
//   }
// }

module.exports = {
  addTweet,
  getAllTweets,
  getTweet,
  getReplies,
  likeTweet,
  dislikeTweet,
  deleteTweet,
  getTweetsByUserId,
  getTweetsForHome,
  addRetweet,
}
