const firebase = require("../db")
const Follow = require("../models/follow")
const firestore = firebase.firestore()

const addFollow = async (req, res, next) => {
  try {
    const data = req.body
    const followRef = await firestore.collection("follows").doc()
    const followRefId = followRef.id
    followRef.set(data)
    res.send({ ...data, id: followRefId })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getAllFollows = async (req, res, next) => {
  try {
    const follows = await firestore.collection("follows")
    const data = await follows.get()
    const followsArray = []
    if (data.empty) {
      res.status(404).send("No follow record found")
    } else {
      data.forEach((doc) => {
        const follow = new Follow(
          doc.id,
          doc.data().userId,
          doc.data().followedUserId
        )
        followsArray.push(follow)
      })
      res.send(followsArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getFollowedUsers = async (req, res, next) => {
  try {
    const id = req.params.id
    const follows = await firestore.collection("follows")
    const followsCollection = await follows.get()
    const followedUsersArray = []
    if (followedUsersArray.empty) {
      res.status(404).send("Nobody is following nobody")
    } else {
      followsCollection.forEach((doc) => {
        // const isInIds = data.includes(doc.id)
        if (doc.data().userId === id) {
          const follow = new Follow(
            doc.id,
            doc.data().userId,
            doc.data().followedUserId
          )
          followedUsersArray.push(follow)
        }
      })
      res.send(followedUsersArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getFollowers = async (req, res, next) => {
  try {
    const id = req.params.id
    const follows = await firestore.collection("follows")
    const followsCollection = await follows.get()
    const followedUsersArray = []
    if (followedUsersArray.empty) {
      res.status(404).send("Nobody is following nobody")
    } else {
      followsCollection.forEach((doc) => {
        // const isInIds = data.includes(doc.id)
        if (doc.data().followedUserId === id) {
          const follow = new Follow(
            doc.id,
            doc.data().userId,
            doc.data().followedUserId
          )
          followedUsersArray.push(follow)
        }
      })
      res.send(followedUsersArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const deleteFollow = async (req, res, next) => {
  try {
    const id = req.params.id
    await firestore.collection("follows").doc(id).delete()
    res.send("Record deleted successfuly")
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  addFollow,
  getAllFollows,
  deleteFollow,
  getFollowedUsers,
  getFollowers,
}
