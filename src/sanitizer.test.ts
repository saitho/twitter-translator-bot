import {sanitizeTweet, unsanitizeTweetText} from "./sanitizer"

describe('Sanitizer', () => {

    const data = [
        {
            label: 'hashtags at the start',
            input: '#hashtags #are great',
            output: '<sh>#hashtags</sh> <sh>#are</sh> great',
            output_unsanitized: '#hashtags #are great'
        },
        {
            label: 'hashtag at the end',
            input: 'Hello world #hi',
            output: 'Hello world <sh>#hi</sh>',
            output_unsanitized: 'Hello world #hi'
        },
        {
            label: 'multiple hashtags',
            input: 'This #text has multiple #hashtags.',
            output: 'This <sh>#text</sh> has multiple <sh>#hashtags</sh>.',
            output_unsanitized: 'This #text has multiple #hashtags.'
        },
        {
            label: 'user mention at the start',
            input: '@saitho95 Check this out!',
            output: '<su>saitho95</su> Check this out!',
            output_unsanitized: 'saitho95 Check this out!',
        },
        {
            label: 'user mention at the end',
            input: 'Check this out! @saitho95',
            output: 'Check this out! <su>saitho95</su>',
            output_unsanitized: 'Check this out! saitho95',
        },
        {
            label: 'user mention and hashtag',
            input: '@saitho95 Check #this out!',
            output: '<su>saitho95</su> Check <sh>#this</sh> out!',
            output_unsanitized: 'saitho95 Check #this out!'
        }
    ];
    describe.each(data)(`Sanitize a tweet with...`, (tweet) => {
        it(`${tweet.label}`, () => {
            expect(sanitizeTweet(tweet.input)).toBe(tweet.output)
        });
    });

    describe.each(data)(`Unsanitize a tweet with...`, (tweet) => {
        it(`${tweet.label}`, () => {
            expect(unsanitizeTweetText(tweet.output)).toBe(tweet.output_unsanitized)
        });
    });
})
