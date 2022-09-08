class Tweet {
  constructor(id, parentId, userId, text, likes, retweets, createdAt) {
    this.id = id
    this.parentId = parentId
    this.userId = userId
    this.text = text
    this.likes = likes
    this.retweets = retweets
    this.createdAt = createdAt
  }
}

module.exports = Tweet
