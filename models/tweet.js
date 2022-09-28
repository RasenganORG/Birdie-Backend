class Tweet {
  constructor(id, parentId, userId, text, likes, retweets, createdAt, url) {
    this.id = id
    this.parentId = parentId
    this.userId = userId
    this.text = text
    this.likes = likes
    this.retweets = retweets
    this.createdAt = createdAt
    this.url = url
  }
}

module.exports = Tweet
