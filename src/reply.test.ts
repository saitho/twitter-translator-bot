import reply, {parseTemplate, buildTextParts} from "./reply"
import {TwitterApi} from "twitter-api-v2";
import {anything, instance, mock, resetCalls, verify, when} from "ts-mockito";
import TwitterApiv2 from "twitter-api-v2/dist/v2/client.v2";

import { getFlag } from './language'
jest.mock('./language')

describe('Reply', () => {
    const data = [
        {
            label: 'Text with 120 characters',
            targetLanguage: 'en',
            originalTweetId: '1234',
            text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magn',
            tweets: 1,
        },
        {
            label: 'Text with 280 characters split into 2 tweets',
            targetLanguage: 'en',
            originalTweetId: '1234',
            text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum ',
            tweets: 2,
        },
        {
            label: 'Text with 480 characters split into 3 tweets',
            targetLanguage: 'en',
            originalTweetId: '1234',
            text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et ju',
            tweets: 3,
        }
    ];

    // Creating mock
    let apiMock: TwitterApiv2 = mock(TwitterApiv2);
    when(apiMock.tweet(anything())).thenResolve({data: {id: "123", text: "test"}})
    let baseMock: TwitterApi = mock(TwitterApi);
    when(baseMock.v2).thenReturn(instance(apiMock))

    // Explicit, readable verification
    describe.each(data)(`Tweet...`, (tweet) => {
        it(`${tweet.label}`, (done) => {
            reply(instance(baseMock), tweet.targetLanguage, tweet.originalTweetId, tweet.text)
                .then(() => {
                    verify(apiMock.tweet(anything())).times(tweet.tweets);
                    resetCalls(apiMock);
                    done()
                })
                .catch(done)
        });
    });

    const templateData = [{
        label: 'flag',
        template: '{flag}',
        output: 'FLAG_EN'
    }, {
        label: 'text',
        template: '{text}',
        output: 'Text'
    }, {
        label: 'current count',
        template: '{c}',
        output: '1'
    }, {
        label: 'total count',
        template: '{t}',
        output: '2'
    }, {
        label: 'text with emoji',
        template: '✔️{text}',
        output: '✔️Text'
    }]
    const getFlagMock = getFlag as jest.MockedFunction<(targetLanguage: string) => string>;
    getFlagMock.mockReturnValue('FLAG_EN');
    describe.each(templateData)(`Parse template...`, (d => {
        it(d.label, () => {
            const output = parseTemplate(d.template, 'en', 'Text', 1, 2)
            expect(output).toBe(d.output)
        })
    }))

    describe.each(data)('buildTextParts', (d) => {
        it(d.label, () => {
            const paths = buildTextParts(d.text, 'en')
            expect(paths.length).toBe(d.tweets)
        })
    })
})
