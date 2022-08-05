"use strict"

const firebase = require("../db")
const User = require("../models/user")
const firestore = firebase.firestore()

const addUser = async (req, res, next) => {
  try {
    const data = req.body
    await firestore.collection("users").doc().set(data)
    res.send("Record saved successfuly")
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
          doc.data().userName,
          doc.data().email,
          doc.data().password
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

module.exports = {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getLoggedUser,
}
