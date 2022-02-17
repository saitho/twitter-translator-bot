import fetch from "./fetch"
import reply from "./reply"
import translate from "./translate"

import {getAuthenticatedClient} from "./oauth/client";
import {buildFixedTranslationsFromEnv, sanitizeTweet, unsanitizeTweetText} from "./sanitizer";
import {isTranslatable, normalizeLanguageCode} from "./language";

(async () => {
    const targetLanguage = normalizeLanguageCode(process.env.TARGET_LANGUAGE || 'EN')
    const authedClient = await getAuthenticatedClient()
    const fixedTranslations = buildFixedTranslationsFromEnv()

    await fetch(targetLanguage, authedClient)
        .then(async (tweets) => {
            for (const tweet of tweets) {
                const tweetText = tweet.text
                if (!isTranslatable(tweetText)) {
                    continue
                }

                const sanitizedTweet = sanitizeTweet(tweetText, fixedTranslations)
                const translation = await translate(tweet.lang as string, targetLanguage, sanitizedTweet)
                if (translation === '') {
                    continue
                }
                const adaptedText = unsanitizeTweetText(translation, fixedTranslations)
                await reply(authedClient, targetLanguage, tweet.id, adaptedText)
            }
        })
        .catch((error: Error) => {
            console.error(error)
            process.exit(-1);
        })
    process.exit();
})();
