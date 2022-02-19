import {TweetV2PostTweetResult, TwitterApi} from "twitter-api-v2";
import {split} from "sentence-splitter";
import {getFlag} from "./language";
import {logger} from "./logger";

const TWITTER_CHARACTER_LIMIT = 280;

const replyTemplate = `🤖{flag}： {text}`
const replySplitTemplate = `🤖{flag} ({c}/{t})： {text}`

export function parseTemplate(template: string, targetLanguage: string, text: string, num: number, max: number): string {
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

export function buildTextParts(text: string, targetLanguage: string): string[] {
    let textParts = []
    let currentText = ''
    let availableCharacters = (TWITTER_CHARACTER_LIMIT - parseTemplate(replySplitTemplate, targetLanguage, '', 0, 0).length)
    for (const chunk of split(text)) {
        if ((currentText.length + chunk.raw.length) > availableCharacters) {
            textParts.push(currentText.trim())
            currentText = ''
            if (chunk.type === "WhiteSpace") {
                continue
            }
        }
        currentText += chunk.raw
    }
    textParts.push(currentText.trim())
    return textParts
}

export default async function reply(authedClient: TwitterApi, targetLanguage: string, originalTweetId: string, text: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        if (text.length > (TWITTER_CHARACTER_LIMIT - parseTemplate(replyTemplate, targetLanguage, '', 0, 0).length)) {
            // text exceeds limit, split it
            let textParts = buildTextParts(text, targetLanguage)
            let replyId = originalTweetId
            const total = textParts.length
            for (const i in textParts) {
                const curr = (Number(i) + 1)
                const parsedText = parseTemplate(replySplitTemplate, targetLanguage, textParts[i], curr, total)
                logger.debug(`Tweeting translated tweet #${originalTweetId} (tweet ${curr}/${total}): ${parsedText}`)
                const reply = await sendReply(authedClient, replyId, parsedText)
                if (!reply) {
                    logger.error('Unable to tweet reply. Aborting')
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
        logger.debug(`Tweeting translated tweet #${originalTweetId} (tweet 1/1): ${parsedText}`)
        sendReply(authedClient, originalTweetId, parsedText)
            .then(() => resolve())
            .catch(reject)
    })
}
