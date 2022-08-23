class Retweet {
  constructor(id, userId, retweetedTweetId) {
    this.id = id // id-ul retweetului
    this.userId = userId // id-ul userrului care face retweet
    this.retweetedTweetId = retweetedTweetId // id-ul tweet-ului la care s-a dat retweet
  }
}

module.exports = Retweet
