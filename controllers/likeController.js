const firebase = require("../db")
const Like = require("../models/like")
const firestore = firebase.firestore()

const addLike = async (req, res, next) => {
  try {
    const data = req.body
    const likeRef = await firestore.collection("likes").doc()
    const tweet = await firestore
      .collection("tweets")
      .doc(data.likedTweetId)
      .get()

    const likeRefId = likeRef.id
    likeRef.set(data)
    res.send({ ...tweet.data(), id: data.likedTweetId })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

// const getUsers = async (req, res, next) => {
//   try {
//     const id = req.params.id
//     const users = await firestore.collection("users")
//     const usersCollection = await users.get()
//     const tweet = await firestore.collection("tweets").doc(id)
//     const tweetData = await tweet.get()
//     const likes = await firestore.collection("likes")
//     const likesCollection = await likes.where("likedTweetId", "==", id).get()
//     const usersArray = []

//     if (!tweetData.exists) {
//       res.status(404).send("Tweet with the given ID not found")
//     } else {
//       likesCollection.forEach((doc) => {
//         const like = new Like(
//           doc.id,
//           doc.data().userId,
//           doc.data().likedTweetId
//         )
//         usersArray.push(like)
//       })
//       res.send(usersArray)
//     }
//   } catch (error) {
//     res.status(400).send(error.message)
//   }
// }

const del = async (id) => {
  try {
    await firestore.collection("likes").doc(id).delete()

    console.log("Record deleted successfuly")
  } catch (error) {
    console.log(error.message)
  }
}

const deleteLike = async (req, res, next) => {
  try {
    const data = req.body.data
    console.log(data)
    const like = await firestore
      .collection("likes")
      .where("userId", "==", data.userId)
      .where("likedTweetId", "==", data.likedTweetId)
      .get()

    like.forEach((doc) => {
      del(doc.id)
    })

    res.send("Record deleted successfuly")
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  addLike,
  deleteLike,
}
