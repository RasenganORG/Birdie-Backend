class Retweet {
  constructor(id, userId, retweetedTweetId, createdAt) {
    this.id = id // id-ul retweetului
    this.userId = userId // id-ul userrului care face retweet
    this.retweetedTweetId = retweetedTweetId // id-ul tweet-ului la care s-a dat retweet
    this.createdAt = createdAt
  }
}

module.exports = Retweet
