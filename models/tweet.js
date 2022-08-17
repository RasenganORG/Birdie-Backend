class Tweet {
  constructor(id, parentId, userId, text, likes, retweets) {
    this.id = id
    this.parentId = parentId
    this.userId = userId
    this.text = text
    this.likes = likes
    this.retweets = retweets
  }
}

module.exports = Tweet
