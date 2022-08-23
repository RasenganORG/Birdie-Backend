"use strict"

const firebase = require("../db")
const User = require("../models/user")
const Follow = require("../models/follow")
const firestore = firebase.firestore()

const addUser = async (req, res, next) => {
  try {
    const data = req.body
    const userRef = await firestore.collection("users").doc()
    const userRefId = userRef.id
    userRef.set(data)
    res.send({ ...data, id: userRefId })
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getAllUsers = async (req, res, next) => {
  try {
    const users = await firestore.collection("users")
    const data = await users.get()
    const usersArray = []
    if (data.empty) {
      res.status(404).send("No user record found")
    } else {
      data.forEach((doc) => {
        const user = new User(
          doc.id,
          // doc.data().firstName,
          // doc.data().lastName,
          doc.data().name,
          doc.data().username,
          doc.data().email,
          doc.data().password,
          doc.data().avatar,
          doc.data().bio,
          doc.data().background
        )
        usersArray.push(user)
      })
      res.send(usersArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getUser = async (req, res, next) => {
  try {
    const id = req.params.id
    const user = await firestore.collection("users").doc(id)
    const data = await user.get()
    if (!data.exists) {
      res.status(404).send("User with the given ID not found")
    } else {
      res.send(data.data())
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

// const getUserById = async (req, res, next) => {
//   try {
//     const id = req.params.id
//     const user = await firestore.collection("users").doc(id)
//     const data = await user.get()
//     if (!data.exists) {
//       res.status(404).send("User with the given ID not found")
//     } else {
//       res.send(data.data())
//     }
//   } catch (error) {
//     res.status(400).send(error.message)
//   }
// }

const getUserById = async (req, res, next) => {
  try {
    const { userId, followedUserId } = req.query
    const user = await firestore.collection("users").doc(followedUserId)
    const userData = await user.get()
    const follows = await firestore
      .collection("follows")
      .where("followedUserId", "==", followedUserId)
      .get()
    const usersFollowing = []

    follows.forEach((doc) => {
      const follow = new Follow(
        doc.id,
        doc.data().userId,
        doc.data().followedUserId
      )
      usersFollowing.push(follow)
    })

    if (!userData.exists) {
      res.status(404).send("User with the given ID not found")
    } else {
      let isFollowed = usersFollowing.find((f) => f.userId === userId)
      if (isFollowed === undefined) {
        isFollowed = false
      } else {
        isFollowed = true
      }
      res.send({ ...userData.data(), isFollowed })
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

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

// const getUsersById = async (req, res, next) => {
//   try {
//     const { userIds } = req.query
//     const users = await firestore.collection("users")
//     const usersCollection = await users.where("id", "in", userIds).get()
//     const usersArray = []
//     usersCollection.forEach((doc) => {
//       const user = new User(
//         doc.id,
//         doc.data().name,
//         doc.data().username,
//         doc.data().email,
//         doc.data().password,
//         doc.data().avatar,
//         doc.data().bio,
//         doc.data().background
//       )
//       usersArray.push(user)
//     })
//     res.send(usersArray)
//   } catch (error) {
//     res.status(400).send(error.message)
//   }
// }

const getUsersById = async (req, res, next) => {
  try {
    const { userId } = req.query
    const users = await firestore.collection("users")
    const usersCollection = await users.get()
    const follows = await firestore.collection("follows")
    const followsCollection = await follows.where("userId", "==", userId)
    const usersArray = []
    usersCollection.forEach((doc) => {
      const user = new User(
        doc.id,
        doc.data().name,
        doc.data().username,
        doc.data().email,
        doc.data().password,
        doc.data().avatar,
        doc.data().bio,
        doc.data().background
      )
      usersArray.push(user)
    })
    res.send(usersArray)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getFollowedUsers = async (req, res) => {
  try {
    const userId = req.params.id
    const usersArray = await getUsersArray()
    const follows = await firestore.collection("follows")
    const followsCollection = await follows.where("userId", "==", userId).get()
    const followedUsersArray = []
    followsCollection.forEach((doc) => {
      const userData = usersArray.find(
        (u) => u.id === doc.data().followedUserId
      )
      const user = new User(
        userData.id,
        userData.name,
        userData.username,
        userData.email,
        userData.password,
        userData.avatar
      )
      followedUsersArray.push(user)
    })
    if (followedUsersArray.empty) {
      res.status(404).send("User with the given ID not found")
    } else {
      res.send(followedUsersArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getFollowers = async (req, res, next) => {
  try {
    const userId = req.params.id
    const usersArray = await getUsersArray()
    const follows = await firestore.collection("follows")
    const followsCollection = await follows
      .where("followedUserId", "==", userId)
      .get()
    const followedUsersArray = []
    followsCollection.forEach((doc) => {
      const userData = usersArray.find((u) => u.id === doc.data().userId)
      const user = new User(
        userData.id,
        userData.name,
        userData.username,
        userData.email,
        userData.password,
        userData.avatar
      )
      followedUsersArray.push(user)
    })
    if (followedUsersArray.empty) {
      res.status(404).send("User with the given ID not found")
    } else {
      res.send(followedUsersArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = req.body
    const user = await firestore.collection("users").doc(id)
    await user.update(data)
    res.send("User record updated successfuly")
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id
    await firestore.collection("users").doc(id).delete()
    res.send("Record deleted successfuly")
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getLoggedUser = async (req, res, next) => {
  try {
    // Get user name from GET Params
    const email = req.params.email
    const pwd = req.query.pwd
    // Reference to Firestore 'users' collection
    const usersCollection = firestore.collection("users")
    // Reference to a QuerySnapshot whith all users that have the requested email
    const userSnapshot = await usersCollection.where("email", "==", email).get()

    if (userSnapshot.empty) {
      res.status(404).send("User with the given email not found!")
    } else {
      let user

      userSnapshot.forEach((doc) => (user = { ...doc.data(), id: doc.id }))
      console.log("user from db:", user)

      const result = user.password === pwd ? user : null
      if (result) res.send(result)
      else res.status(404).send("Username or password invalid!")
    }
  } catch (error) {
    res.status(404).send(error.message)
  }
}

const getUsersByUsername = async (req, res, next) => {
  try {
    const { username } = req.query
    const usersCollection = firestore.collection("users")
    const usersSnapshot = await usersCollection
      .where("username", "==", username)
      .get()

    if (usersSnapshot.empty) {
      res.status(404).send("User with the given ID not found")
    } else {
      let users = []
      usersSnapshot.forEach((user) => {
        users.push({ ...user.data(), id: user.id })
      })
      res.send(users)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getLoggedUser,
  getUsersByUsername,
  getUserById,
  getUsersById,
  getFollowedUsers,
  getFollowers,
}
