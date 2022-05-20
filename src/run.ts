import fetch from "./fetch"
import reply from "./reply"
import translate from "./translate"

import {buildFixedTranslationsFromEnv, sanitizeTweet, unsanitizeTweetText} from "./sanitizer";
import {isTranslatable, normalizeLanguageCode} from "./language";
import {TwitterApi} from "twitter-api-v2";

export function run(authedClient: TwitterApi): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        const targetLanguage = normalizeLanguageCode(process.env.TARGET_LANGUAGE || 'EN')
        const fixedTranslations = buildFixedTranslationsFromEnv()

        const accounts = process.env.TWITTER_ACCOUNTS || ''
        if (!accounts.length) {
            reject(new Error(`Missing TWITTER_ACCOUNTS environment variable.`))
            return
        }
        const accountsArr = accounts.split(',').map((a) => a.trim()).filter((a) => a.length)

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
                    await reply(authedClient, targetLanguage, tweet.id, adaptedText)
                }
                resolve()
            })
            .catch(reject)
    })
}
