import fetch from './fetch'
import translate from './translate'
import {isTranslatable} from "./language";
import {run} from "./run";
import {TweetV2, TwitterApi, TwitterApiv2} from "twitter-api-v2";
import {anyString, anything, instance, mock, verify, when} from "ts-mockito";
import reply from "./reply";

jest.mock('./fetch')
jest.mock('./reply')
jest.mock('./translate')
jest.mock('./oauth/client')
jest.mock('./sanitizer')
jest.mock('./language')

let envBackup: NodeJS.ProcessEnv

describe(`Tweet...`, () => {
    beforeEach(() => {
        envBackup = process.env
    })
    afterEach(() => {
        process.env = envBackup
        // @ts-ignore
        reply.mockClear();
    })

    it(`fail on missing accounts`, (done) => {
        const client = mock(TwitterApi)
        run(client).then(() => {
            done('Expected run to fail')
        }).catch((error) => {
            expect(error).toBeInstanceOf(Error)
            done()
        })
    })

    describe.each([true, false])(`retweet instead of reply`, (translatable) => {

        describe.each([true, false])(`(translatable=${translatable})`, (retweet) => {
            it(`retweet=${retweet}`, async () => {
                process.env.TWITTER_ACCOUNTS = 'test'
                process.env.RETWEET_WHEN_NOTRANSATION_NEEDED = Number(retweet).toString()

                const fetchMock = fetch as jest.MockedFunction<(accounts: string[], targetLanguage: string, authedClient: TwitterApi) => Promise<TweetV2[]>>
                fetchMock.mockReturnValue(new Promise<TweetV2[]>((resolve) => {
                    resolve([{ id: 't123', text: 'Text'}])
                }))
                const isTranslatableMock = isTranslatable as jest.MockedFunction<(text: string) => boolean>
                isTranslatableMock.mockReturnValue(translatable)
                const translateMock = translate as jest.MockedFunction<(sourceLang: string, targetLang: string, text: string) => Promise<string>>
                translateMock.mockResolvedValue('')

                const v2Mock = mock(TwitterApiv2)
                // @ts-ignore
                when(v2Mock.me()).thenResolve({data: {id: 'u123'}})

                const client = mock(TwitterApi)
                when(client.v2).thenReturn(instance(v2Mock))

                const result = await run(instance(client))
                if (retweet) {
                    verify(v2Mock.retweet('u123', 't123')).once()
                } else {
                    verify(v2Mock.retweet(anyString(), anyString())).never()
                }

                // @ts-ignore
                expect(reply.mock.calls.length).toBe(0);

                expect(result).toBeUndefined()
            })
        })
    })
})
