import {TwitterApiv2} from "twitter-api-v2";
import reply from "./reply";

function collectTweetMap(historyFileContent: any[]): Map<string, string[]> {
    const originalTweetIdsToTweetIdsMap = new Map<string, string[]>();
    if (!Array.isArray(historyFileContent) || !historyFileContent.length) {
        return originalTweetIdsToTweetIdsMap
    }
    for (let historyFileContentElement of historyFileContent) {
        if (!historyFileContentElement.hasOwnProperty('tweetId') ||
            !historyFileContentElement.hasOwnProperty('originalTweetId')) {
            continue
        } {
            if (!originalTweetIdsToTweetIdsMap.has(historyFileContentElement.originalTweetId)) {
                originalTweetIdsToTweetIdsMap.set(historyFileContentElement.originalTweetId, [])
            }
            originalTweetIdsToTweetIdsMap.get(historyFileContentElement.originalTweetId)!.push(historyFileContentElement.tweetId)
        }
    }
    return originalTweetIdsToTweetIdsMap
}

function getTweetGroups(tweetsMap: Map<string, string[]>): Array<string[]> {
    const requestTweetIdGroups: Array<string[]> = [ [] ]
    const limit = 100 // 100 ids per request allowed
    let index = 0
    for (let key of tweetsMap.keys()) {
        if (requestTweetIdGroups[index].length >= limit) {
            index++
            requestTweetIdGroups[index] = []
        }
        requestTweetIdGroups[index].push(key)
    }
    return requestTweetIdGroups
}

async function deleteTweet(api: TwitterApiv2, id: string, tweetsMap: Map<string, string[]>) {
    await api.deleteTweet(id)
    if (tweetsMap.has(id)) {
        for (let replyId of (tweetsMap.get(id) || [])) { // handle own replies to tweet?
            //await deleteTweet(api, replyId, tweetsMap)
        }
    }
}

export async function removeDeletedTweets(api: TwitterApiv2, historyFileContent: any[]) {
    const tweetsMap = collectTweetMap(historyFileContent)
    const requestTweetIdGroups = getTweetGroups(tweetsMap)

    for (let ids of requestTweetIdGroups) {
        const tweets = await api.tweets(ids)
        for (let err of (tweets.errors || [])) {
            if (err.type !== 'https://api.twitter.com/2/problems/resource-not-found') {
                continue
            }
            if (!err.resource_id) {
                continue
            }

            for (let id of (tweetsMap.get(err.resource_id) || [])) {
                await deleteTweet(api, id, tweetsMap)
            }
        }
    }
}
