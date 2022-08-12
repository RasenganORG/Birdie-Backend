class Tweet {
  constructor(id, parentId, userId, text, likes, retweets) {
    this.id = id
    this.parentId = parentId
    this.userId = userId
    this.text = text
    this.likes = likes
    this.retweets = retweets
    this.liked = false
  }
}

module.exports = Tweet
