// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search
import * as fs from "fs"
import {TweetV2, Tweetv2SearchParams, TwitterApi} from "twitter-api-v2";
import {logger} from "./logger";
import path from "path";

const currentDateFile = path.join(__dirname + '..', '..', 'data', 'currentDate.txt')

let startTime: Date | null = null;
if (fs.existsSync(currentDateFile)) {
  const currentDate = fs.readFileSync(currentDateFile).toString().trim()
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
    if (!accounts.length) {
      logger.error(`Missing TWITTER_ACCOUNTS environment variable.`)
      process.exit(1)
    }
    const accountsArr = accounts.split(',').map((a) => a.trim()).filter((a) => a.length)

    let currentCheckTime = new Date()
    const jsTweets = await authedClient.v2.search(
        `(${accountsArr.map(a => 'from:' + a).join(' OR ')}) -is:retweet -is:reply`,
        options
    )

    let newStartTime = startTime;
    if (!jsTweets.tweets.length) {
      logger.debug(`Checking tweets of ${accounts} – no new tweets`)
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
      logger.debug(`Received tweet #${tweet.id} from ${tweet.author_id}: ${tweet.text}`)
      tweets.push(tweet)
    }

    if (newStartTime) {
      // Twitter filter is inclusive, so we need to add a second
      let timePlusSecond = new Date( newStartTime.getTime() + 1 )
      if (currentCheckTime > timePlusSecond) {
        timePlusSecond = currentCheckTime
      }
      fs.writeFileSync(currentDateFile, timePlusSecond.toISOString().trim())
    }
    resolve(tweets)
  })
}
