import {getFlag, normalizeLanguageCode} from "./language";

describe(`language`, () => {
    describe.each([
        {label: 'ISO-639-1', languageCode: 'en', output: 'EN'},
        {label: 'ISO 639-1 with country code', languageCode: 'en-US', output: 'EN-US'},
        {label: 'ISO 639-1 with country code but underscore', languageCode: 'en_US', output: 'EN-US'}
    ])(`normalizeLanguageCode`, (d) => {
        it(d.label, () => {
            expect(normalizeLanguageCode(d.languageCode)).toBe(d.output)
        })
    })
    describe.each([
        {label: 'English flag', languageCode: 'en', output: '🇬🇧'},
        {label: 'American flag', languageCode: 'en-US', output: '🇺🇸'},
        {label: 'German flag', languageCode: 'de', output: '🇩🇪'}
    ])(`getFlag`, (d) => {
        it(d.label, () => {
            expect(getFlag(d.languageCode)).toBe(d.output)
        })
    })
})
