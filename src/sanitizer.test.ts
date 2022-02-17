import {
    buildFixedTranslationsFromEnv,
    sanitizeTweet,
    unsanitizeTweetText
} from "./sanitizer"

describe('Sanitizer', () => {
    const data = [
        {
            label: 'hashtags at the start',
            input: '#hashtags #are great',
            output: '<sh>#hashtags</sh> <sh>#are</sh> great',
            output_unsanitized: '#hashtags #are great',
            fixedTranslations: {}
        },
        {
            label: 'hashtag at the end',
            input: 'Hello world #hi',
            output: 'Hello world <sh>#hi</sh>',
            output_unsanitized: 'Hello world #hi',
            fixedTranslations: {}
        },
        {
            label: 'multiple hashtags',
            input: 'This #text has multiple #hashtags.',
            output: 'This <sh>#text</sh> has multiple <sh>#hashtags</sh>.',
            output_unsanitized: 'This #text has multiple #hashtags.',
            fixedTranslations: {}
        },
        {
            label: 'user mention at the start',
            input: '@saitho95 Check this out!',
            output: '<su>saitho95</su> Check this out!',
            output_unsanitized: 'saitho95 Check this out!',
            fixedTranslations: {}
        },
        {
            label: 'user mention at the end',
            input: 'Check this out! @saitho95',
            output: 'Check this out! <su>saitho95</su>',
            output_unsanitized: 'Check this out! saitho95',
            fixedTranslations: {}
        },
        {
            label: 'user mention and hashtag',
            input: '@saitho95 Check #this out!',
            output: '<su>saitho95</su> Check <sh>#this</sh> out!',
            output_unsanitized: 'saitho95 Check #this out!',
            fixedTranslations: {}
        },
        {
            label: 'user mention, hashtag and whitelist',
            input: '@saitho95 Check #this out!',
            output: '<su>saitho95</su> <sw>Check</sw> <sh>#this</sh> out!',
            output_unsanitized: 'saitho95 Check_fixed #this out!',
            fixedTranslations: {'Check': 'Check_fixed'}
        },
        {
            label: 'Japanese text',
            input: '@saitho95 これはテストツイートです。#test  無視してください。🙈 #twitter #ツイッター',
            output: '<su>saitho95</su> <sw>これ</sw>はテストツイートです。<sh>#test</sh>  無視してください。🙈 <sh>#twitter</sh> <sh>#ツイッター</sh>',
            output_unsanitized: 'saitho95 foobarはテストツイートです。#test  無視してください。🙈 #twitter #ツイッター',
            fixedTranslations: {'これ': 'foobar'}
        }
    ];
    describe.each(data)(`Sanitize a tweet with...`, (tweet) => {
        it(`${tweet.label}`, () => {
            expect(sanitizeTweet(tweet.input, tweet.fixedTranslations)).toBe(tweet.output)
        });
    });

    describe.each(data)(`Unsanitize a tweet with...`, (tweet) => {
        it(`${tweet.label}`, () => {
            expect(unsanitizeTweetText(tweet.output, tweet.fixedTranslations)).toBe(tweet.output_unsanitized)
        });
    });

    describe(`Build fixed translations from env`, () => {
        it(`builds a valid object`, () => {
            process.env.FIXED_TRANSLATIONS_FILE = __dirname + '/../translations.xlf'
            expect(buildFixedTranslationsFromEnv()).toStrictEqual({
                foo: 'bar',
                foobar: 'Foo, bar!',
                "bar foo?": 'foo bar?'
            })
        });
    });
})
