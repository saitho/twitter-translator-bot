import {TwitterApiv2} from "twitter-api-v2";
import {anyString, anything, mock, verify, when} from "ts-mockito";
import {removeDeletedTweets} from "./removeDeletedTweets";

jest.mock('./language')

describe('Remove Deleted Tweets', () => {
    // Creating mock
    let apiMock: TwitterApiv2 = mock(TwitterApiv2);
    when(apiMock.tweets(anything())).thenResolve({
        data: [],
        includes: undefined,
        errors: [
            {type: 'https://api.twitter.com/2/problems/resource-not-found', resource_id: '123', detail: '', title: ''},
            {type: 'other_error', resource_id: '456', detail: '', title: ''}
        ]
    })
    when(apiMock.deleteTweet(anyString())).thenResolve()

    it(`delete tweet translations of deleted tweets`, (done) => {
        const historyFileContent = [
            {"tweetId": "t123", "originalTweetId": "123"},
            {"tweetId": "tr123", "originalTweetId": "t123"}, // reply to t123
            {"tweetId": "t456", "originalTweetId": "456"}
        ]

        removeDeletedTweets(apiMock, historyFileContent)
            .then(() => {
                verify(apiMock.tweets(['123', '456'])).once()
                verify(apiMock.deleteTweet('t123')).once()
                verify(apiMock.deleteTweet('tr123')).once()
                verify(apiMock.deleteTweet('t456')).never()
                verify(apiMock.deleteTweet('123')).never()
                verify(apiMock.deleteTweet('456')).never()
            })
            .catch((error) => done(error))
    })
})
