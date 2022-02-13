import fetch from "./fetch"
import reply from "./reply"
import translate from "./translate"

import {getAuthenticatedClient} from "./oauth/client";
import {sanitizeTweet, unsanitizeTweetText} from "./sanitizer";
import {normalizeLanguageCode} from "./language";

(async () => {
    const targetLanguage = normalizeLanguageCode(process.env.TARGET_LANGUAGE || 'EN')
    const authedClient = await getAuthenticatedClient()

    await fetch(targetLanguage, authedClient)
        .then(async (tweets) => {
            for (const tweet of tweets) {
                const tweetText = tweet.text

                const sanitizedTweet = sanitizeTweet(tweetText)
                const translation = await translate(tweet.lang as string, targetLanguage, sanitizedTweet)
                if (translation === '') {
                    continue
                }
                const adaptedText = unsanitizeTweetText(translation)
                await reply(authedClient, targetLanguage, tweet.id, adaptedText)
            }
        })
        .catch((error: Error) => {
            console.error(error)
            process.exit(-1);
        })
    process.exit();
})();


// requestOAuth()
