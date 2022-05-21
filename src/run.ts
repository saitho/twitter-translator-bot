import fetch from "./fetch"
import reply from "./reply"
import translate from "./translate"

import {buildFixedTranslationsFromEnv, sanitizeTweet, unsanitizeTweetText} from "./sanitizer";
import {isTranslatable, normalizeLanguageCode} from "./language";
import {TwitterApi} from "twitter-api-v2";
import fs from "fs";
import {removeDeletedTweets} from "./removeDeletedTweets";

export function run(authedClient: TwitterApi): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        const targetLanguage = normalizeLanguageCode(process.env.TARGET_LANGUAGE || 'EN')
        const fixedTranslations = buildFixedTranslationsFromEnv()
        const historyFile = './data/history.json'
        let historyFileContent: any[] = []
        if (fs.existsSync(historyFile)) {
            historyFileContent = JSON.parse(fs.readFileSync(historyFile).toString().trim())
        }

        const accounts = process.env.TWITTER_ACCOUNTS || ''
        if (!accounts.length) {
            reject(new Error(`Missing TWITTER_ACCOUNTS environment variable.`))
            return
        }
        const accountsArr = accounts.split(',').map((a) => a.trim()).filter((a) => a.length)

        if (Number(process.env.REMOVE_DELETED_TWEETS)) {
           await removeDeletedTweets(authedClient.v2, historyFileContent)
        }

        await fetch(accountsArr, targetLanguage, authedClient)
            .then(async (tweets) => {
                for (const tweet of tweets) {
                    const tweetText = tweet.text
                    if (!isTranslatable(tweetText)) {
                        if (Number(process.env.RETWEET_WHEN_NOTRANSATION_NEEDED)) {
                            await authedClient.v2.retweet((await authedClient.v2.me()).data.id, tweet.id)
                        }
                        continue
                    }

                    const sanitizedTweet = sanitizeTweet(tweetText, fixedTranslations)
                    const translation = await translate(tweet.lang as string, targetLanguage, sanitizedTweet)
                    if (translation === '') {
                        if (Number(process.env.RETWEET_WHEN_NOTRANSATION_NEEDED)) {
                            await authedClient.v2.retweet((await authedClient.v2.me()).data.id, tweet.id)
                        }
                        continue
                    }
                    const adaptedText = unsanitizeTweetText(translation, fixedTranslations)
                    const responses = await reply(authedClient, targetLanguage, tweet.id, adaptedText)

                    historyFileContent.push(...responses.map((r) => {
                        return {tweetId: r.data.id, originalTweetId: tweet.id, createDate: tweet.created_at}
                    }))
                }
                fs.writeFileSync(historyFile, JSON.stringify(historyFileContent))
                resolve()
            })
            .catch(reject)
    })
}
