import {TweetV2PostTweetResult, TwitterApi} from "twitter-api-v2";
import {split} from "sentence-splitter";
import {getFlag} from "./language";

const TWITTER_CHARACTER_LIMIT = 280;

const replyTemplate = `🤖{flag}： {text}`
const replySplitTemplate = `🤖{flag} ({c}/{t})： {text}`

function parseTemplate(template: string, targetLanguage: string, text: string, num: number, max: number): string {
    return template
        .replace('{text}', text)
        .replace('{flag}', getFlag(targetLanguage))
        .replace('{c}', num.toString())
        .replace('{t}', max.toString())
}

function sendReply(authedClient: TwitterApi, originalTweetId: string, text: string): Promise<TweetV2PostTweetResult> {
    //return new Promise<TweetV2PostTweetResult>((resolve) => resolve({data: {id: "-1", text: "test"}}))
    return authedClient.v2.tweet({
        text: text,
        reply: {
            in_reply_to_tweet_id: originalTweetId
        }
    })
}

export default async function reply(authedClient: TwitterApi, targetLanguage: string, originalTweetId: string, text: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        if (text.length > (TWITTER_CHARACTER_LIMIT - parseTemplate(replyTemplate, targetLanguage, '', 0, 0).length)) {
            // text exceeds limit, split it
            let textParts = []
            let currentText = ''
            let availableCharacters = (TWITTER_CHARACTER_LIMIT - parseTemplate(replySplitTemplate, targetLanguage, '', 0, 0).length)
            for (const chunk of split(text)) {
                if ((currentText.length + chunk.raw.length) > availableCharacters) {
                    textParts.push(currentText)
                    currentText = ''
                    if (chunk.type === "WhiteSpace") {
                        continue
                    }
                }
                currentText += chunk.raw
            }
            textParts.push(currentText)
            let replyId = originalTweetId
            for (const i in textParts) {
                const parsedText = parseTemplate(replySplitTemplate, targetLanguage, textParts[i], (Number(i) + 1), textParts.length)
                const reply = await sendReply(authedClient, replyId, parsedText)
                if (!reply) {
                    console.error('Unable to tweet reply. Aborting')
                    reject()
                    return
                }
                replyId = reply.data.id
            }
            resolve()
            return
        }

        // Text length is okay, tweet as-is
        const parsedText = parseTemplate(replyTemplate, targetLanguage, text, 1, 1)
        sendReply(authedClient, originalTweetId, parsedText)
            .then(() => resolve())
            .catch(reject)
    })
}
