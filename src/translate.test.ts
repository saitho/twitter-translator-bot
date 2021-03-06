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
            input: 'This is a text with emoji at the end π',
            output: 'This is a text with emoji at the end.π'
        },
        {
            label: 'Single-line text with multiple emojis at the end',
            language: 'en',
            input: 'This is a text with emoji at the end ππ π',
            output: 'This is a text with emoji at the end.ππ π'
        },
        {
            label: 'Single-line text with emojis in between',
            language: 'en',
            input: 'This is a text with emoji π in between',
            output: 'This is a text with emoji π in between'
        },
        {
            label: 'Multi-line text with emojis at the end',
            language: 'en',
            input: 'This is a text with emoji at the endπ\nAnother line here',
            output: 'This is a text with emoji at the end.π\nAnother line here'
        },
        {
            label: 'Multi-line text with emojis at the ends',
            language: 'en',
            input: 'This is a text with emoji at the endπ\nAnother line hereπ',
            output: 'This is a text with emoji at the end.π\nAnother line here.π'
        },
        {
            label: 'Single-line Japanese text with emojis at the end (use Japanese/Chinese mark)',
            language: 'ja',
            input: 'ιε§γγγγΎγγγγεΏεγεΎγ‘γγ¦γγΎγ π',
            output: 'ιε§γγγγΎγγγγεΏεγεΎγ‘γγ¦γγΎγγπ'
        },
        {
            label: 'Single-line Japanese text with multiple emojis at the end (use Japanese/Chinese mark)',
            language: 'ja',
            input: 'ιε§γγγγΎγγγγεΏεγεΎγ‘γγ¦γγΎγ πππ',
            output: 'ιε§γγγγΎγγγγεΏεγεΎγ‘γγ¦γγΎγγπππ'
        }
    ])(`prepareText`, (d) => {
        it(d.label, () => {
            expect(prepareText(d.input, d.language)).toBe(d.output)
        })
    })
})
