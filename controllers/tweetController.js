const firebase = require("../db")
const Tweet = require("../models/tweet")
const User = require("../models/user")
const Follow = require("../models/follow")
const Like = require("../models/like")
const firestore = firebase.firestore()
const { FieldValue } = require("firebase-admin/firestore")
const { getFollowedUsers } = require("./userController")

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
    const tweets = await firestore.collection("tweets")
    const data = await tweets.get()
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
      res.status(404).send("No tweet record found")
    } else {
      data.forEach(async (doc) => {
        const followed = followedUsersArray.find(
          (f) => doc.data().userId === f.followedUserId
        )
        if (
          (followed && doc.data().parentId === null) ||
          (doc.data().userId === id && doc.data().parentId === null)
        ) {
          const user = usersArray.find((u) => doc.data().userId === u.id)
          console.log("doc.id", doc.id)
          let isLiked = likesCollectionArray.find(
            (like) => like.likedTweetId === doc.id
          )

          console.log({ isLiked })
          if (isLiked === undefined) {
            isLiked = false
          } else {
            isLiked = true
          }

          const tweet = new Tweet(
            doc.id,
            doc.data().parentId,
            doc.data().userId,
            doc.data().text,
            doc.data().likes,
            doc.data().retweets
          )
          const newTweet = { ...tweet, ...user, id: doc.id, isLiked: isLiked }
          tweetsArray.push(newTweet)
        }
      })
      res.send(tweetsArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const addTweet = async (req, res, next) => {
  try {
    const data = req.body
    // const users = await firestore.collection("users")
    // const dataUsers = await users.get()
    // const usersArray = []
    // dataUsers.forEach((doc) => {
    //   const user = new User(
    //     doc.id,
    //     doc.data().name,
    //     doc.data().username,
    //     doc.data().email,
    //     doc.data().password,
    //     doc.data().avatar
    //   )
    //   usersArray.push(user)
    // })
    const usersArray = await getUsersArray()
    const tweetRef = await firestore.collection("tweets").doc()
    const tweetRefId = tweetRef.id
    tweetRef.set(data)
    const user = usersArray.find((u) => data.userId === u.id)

    res.send({ ...data, ...user, id: tweetRefId })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

// const getAllTweets = async (req, res, next) => {
//   try {
//     const tweets = await firestore.collection("tweets")
//     const data = await tweets.get()
//     const tweetsArray = []
//     if (data.empty) {
//       res.status(404).send("No tweet record found")
//     } else {
//       data.forEach((doc) => {
//         const tweet = new Tweet(
//           doc.id,
//           doc.data().parentId,
//           doc.data().userId,
//           doc.data().text,
//           doc.data().likes,
//           doc.data().retweets
//         )
//         tweetsArray.push(tweet)
//       })
//       res.send(tweetsArray)
//     }
//   } catch (error) {
//     res.status(400).send(error.message)
//   }
// }

// const getAllTweets = async (req, res, next) => {
//   try {
//     const tweets = await firestore.collection("tweets")
//     const data = await tweets.get()
//     const usersArray = await getUsersArray()
//     const tweetsArray = []

//     if (data.empty) {
//       res.status(404).send("No tweet record found")
//     } else {
//       data.forEach(async (doc) => {
//         const user = usersArray.find((u) => doc.data().userId === u.id)
//         const tweet = new Tweet(
//           doc.id,
//           doc.data().parentId,
//           doc.data().userId,
//           doc.data().text,
//           doc.data().likes,
//           doc.data().retweets
//         )
//         const newTweet = { ...tweet, ...user, id: doc.id }
//         tweetsArray.push(newTweet)
//       })
//       res.send(tweetsArray)
//     }
//   } catch (error) {
//     res.status(400).send(error.message)
//   }
// }

const getAllTweets = async (req, res, next) => {
  try {
    const tweets = await firestore.collection("tweets")
    const data = await tweets.get()
    const usersArray = await getUsersArray()
    const tweetsArray = []

    if (data.empty) {
      res.status(404).send("No tweet record found")
    } else {
      data.forEach(async (doc) => {
        const user = usersArray.find((u) => doc.data().userId === u.id)
        const tweet = new Tweet(
          doc.id,
          doc.data().parentId,
          doc.data().userId,
          doc.data().text,
          doc.data().likes,
          doc.data().retweets
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

// const getTweet = async (req, res, next) => {
//   try {
//     const id = req.params.id
//     const tweet = await firestore.collection("tweets").doc(id)
//     const data = await tweet.get()
//     if (!data.exists) {
//       res.status(404).send("Tweet with the given ID not found")
//     } else {
//       res.send({ ...data.data(), id })
//     }
//   } catch (error) {
//     res.status(400).send(error.message)
//   }
// }

const getTweet = async (req, res, next) => {
  try {
    const id = req.params.id
    // const users = await firestore.collection("users")
    // const dataUsers = await users.get()
    // const usersArray = []
    // dataUsers.forEach((doc) => {
    //   const user = new User(
    //     doc.id,
    //     doc.data().name,
    //     doc.data().username,
    //     doc.data().email,
    //     doc.data().password,
    //     doc.data().avatar
    //   )
    //   usersArray.push(user)
    // })
    const usersArray = await getUsersArray()
    const tweet = await firestore.collection("tweets").doc(id)
    const data = await tweet.get()
    const user = usersArray.find((u) => data.data().userId === u.id)
    if (!data.exists) {
      res.status(404).send("Tweet with the given ID not found")
    } else {
      res.send({ ...data.data(), ...user, id })
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getTweetsByUserId = async (req, res, next) => {
  try {
    const id = req.params.id
    const user = await firestore.collection("users").doc(id)
    const userData = await user.get()
    const tweets = await firestore.collection("tweets")
    const data = await tweets.get()
    const tweetsArray = []

    if (data.empty) {
      res.status(404).send("No tweet found!")
    } else {
      data.forEach((doc) => {
        if (doc.data().userId === id && doc.data().parentId === null) {
          const tweet = new Tweet(
            doc.id,
            doc.data().parentId,
            doc.data().userId,
            doc.data().text,
            doc.data().likes,
            doc.data().retweets
          )

          tweetsArray.push({ ...tweet, ...userData.data(), id: doc.id })
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
    const tweets = await firestore.collection("tweets")
    const data = await tweets.get()
    const usersArray = await getUsersArray()
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
          const user = usersArray.find((u) => doc.data().userId === u.id)

          repliesArray.push({ ...tweet, ...user, id: doc.id })
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
}
