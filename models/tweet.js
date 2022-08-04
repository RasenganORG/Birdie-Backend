class Tweet {
  constructor(id, userId, text, likes, retweets, replies) {
    this.id = id
    this.userId = userId
    this.text = text
    this.likes = likes
    this.retweets = retweets
    this.replies = replies
  }
}

module.exports = Tweet
