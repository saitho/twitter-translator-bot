// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search
import * as fs from "fs"
import {TweetV2, Tweetv2SearchParams, TwitterApi} from "twitter-api-v2";

let startTime: Date | null = null;
if (fs.existsSync('./currentDate.txt')) {
  const currentDate = fs.readFileSync('./currentDate.txt').toString().trim()
  startTime = currentDate.length ? new Date(currentDate) : null
}

export default function fetch(targetLanguage: string, authedClient: TwitterApi): Promise<TweetV2[]> {
  return new Promise<any[]>(async (resolve) => {
    const tweets: TweetV2[] = []
    const options: Partial<Tweetv2SearchParams> = {"tweet.fields": ["created_at", "lang", "author_id"]}
    if (startTime) {
      options.start_time = startTime.toISOString()
    }
    const accounts = process.env.TWITTER_ACCOUNTS || ''
    const accountsArr = accounts.split(',').map((a) => a.trim()).filter((a) => a.length)

    let currentCheckTime = new Date()
    const jsTweets = await authedClient.v2.search(
        `(${accountsArr.map(a => 'from:' + a).join(' OR ')}) -is:retweet -is:reply`,
        options
    )

    let newStartTime = startTime;
    if (!jsTweets.tweets.length) {
      return
    }
    for await (const tweet of jsTweets) {
      const createDate = new Date(tweet.created_at as string)
      if (!newStartTime || createDate > newStartTime) {
        newStartTime = createDate
      }
      if (tweet.lang!.toLowerCase() === targetLanguage.toLowerCase()) {
        continue
      }
      tweets.push(tweet)
    }

    if (newStartTime) {
      // Twitter filter is inclusive, so we need to add a second
      let timePlusSecond = new Date( newStartTime.getTime() + 1 )
      if (currentCheckTime > timePlusSecond) {
        timePlusSecond = currentCheckTime
      }
      fs.writeFileSync('./currentDate.txt', timePlusSecond.toISOString().trim())
    }
    resolve(tweets)
  })
}
