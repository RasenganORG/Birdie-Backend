const cloudinary = require("cloudinary").v2
const config = require("../config")

cloudinary.config({
  cloud_name: config.cloudinaryConfig.cloudName,
  api_key: config.cloudinaryConfig.apiKey,
  api_secret: config.cloudinaryConfig.apiSecret,
})

const uploadMedia = async (req, res, next) => {
  try {
    const data = req.body.data
    console.log({ data })

    const options = {
      use_filename: false,
      unique_filename: true,
      overwrite: true,
      resource_type: "auto",
    }
    const result = await cloudinary.uploader.upload(data, options)
    console.log(result)

    res.send(result.secure_url)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getMedia = async (req, res, next) => {
  try {
    const result = await cloudinary.api.resource("yfgojrtgb9kpzngau0xd")
    console.log(result)

    res.send(result.public_id)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  uploadMedia,
  getMedia,
}
