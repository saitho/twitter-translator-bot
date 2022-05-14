import {prepareText} from "./translate";

describe(`translate`, () => {
    describe.each([
        {
            label: 'Single-line text without emojis',
            language: 'en',
            input: 'This is text without emojis',
            output: 'This is text without emojis'
        },
        {
            label: 'Single-line text with emoji at the end',
            language: 'en',
            input: 'This is a text with emoji at the end 🎟',
            output: 'This is a text with emoji at the end.🎟'
        },
        {
            label: 'Single-line text with multiple emojis at the end',
            language: 'en',
            input: 'This is a text with emoji at the end 🎟🎟 🎟',
            output: 'This is a text with emoji at the end.🎟🎟 🎟'
        },
        {
            label: 'Single-line text with emojis in between',
            language: 'en',
            input: 'This is a text with emoji 🎟 in between',
            output: 'This is a text with emoji 🎟 in between'
        },
        {
            label: 'Multi-line text with emojis at the end',
            language: 'en',
            input: 'This is a text with emoji at the end🎟\nAnother line here',
            output: 'This is a text with emoji at the end.🎟\nAnother line here'
        },
        {
            label: 'Multi-line text with emojis at the ends',
            language: 'en',
            input: 'This is a text with emoji at the end🎟\nAnother line here🎟',
            output: 'This is a text with emoji at the end.🎟\nAnother line here.🎟'
        },
        {
            label: 'Single-line Japanese text with emojis at the end (use Japanese/Chinese mark)',
            language: 'ja',
            input: '開始いたしました。ご応募お待ちしています 🎟',
            output: '開始いたしました。ご応募お待ちしています。🎟'
        },
        {
            label: 'Single-line Japanese text with multiple emojis at the end (use Japanese/Chinese mark)',
            language: 'ja',
            input: '開始いたしました。ご応募お待ちしています 🎟🎟🎟',
            output: '開始いたしました。ご応募お待ちしています。🎟🎟🎟'
        }
    ])(`prepareText`, (d) => {
        it(d.label, () => {
            expect(prepareText(d.input, d.language)).toBe(d.output)
        })
    })
})
