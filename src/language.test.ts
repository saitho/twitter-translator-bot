import {getFlag, normalizeLanguageCode, isTranslatable} from "./language";

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
    describe(`isTranslatable`, () => {
        it('says a German text is translatable for default', () => {
            expect(isTranslatable('Ich bin 100%ig ein deutscher Text!')).toBeTruthy()
        })
        it('says an English text is translatable for default', () => {
            expect(isTranslatable('100% I am an English text!')).toBeTruthy()
        })
        it('says a Japanese text is not translatable for default', () => {
            expect(isTranslatable('私は100%日本語のテキストです。')).toBeFalsy()
        })
        it('says a number is not translatable for default', () => {
            expect(isTranslatable('100%')).toBeFalsy()
        })
        it('says an emoji is not translatable for default', () => {
            expect(isTranslatable('😂')).toBeFalsy()
        })

        it('says a German text is translatable for a custom regex for Japanese and Arabic alphabet', () => {
            process.env.TRANSLATABLE_MATCH_EXPRESSION = '[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z]+|[ａ-ｚＡ-Ｚ]+|[々〆〤]+'
            expect(isTranslatable('Ich bin 100%ig ein deutscher Text!')).toBeTruthy()
        })
        it('says an English text is translatable for a custom regex for Japanese and Arabic alphabet', () => {
            process.env.TRANSLATABLE_MATCH_EXPRESSION = '[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z]+|[ａ-ｚＡ-Ｚ]+|[々〆〤]+'
            expect(isTranslatable('100% I am an English text!')).toBeTruthy()
        })
        it('says a Japanese text is translatable for a custom regex for Japanese and Arabic alphabet', () => {
            process.env.TRANSLATABLE_MATCH_EXPRESSION = '[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z]+|[ａ-ｚＡ-Ｚ]+|[々〆〤]+'
            expect(isTranslatable('私は100%日本語のテキストです。')).toBeTruthy()
        })
        it('says a number is not translatable for a custom regex for Japanese and Arabic alphabet', () => {
            process.env.TRANSLATABLE_MATCH_EXPRESSION = '[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z]+|[ａ-ｚＡ-Ｚ]+|[々〆〤]+'
            expect(isTranslatable('100%')).toBeFalsy()
        })
        it('says an emoji is not translatable for a custom regex for Japanese and Arabic alphabet', () => {
            process.env.TRANSLATABLE_MATCH_EXPRESSION = '[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z]+|[ａ-ｚＡ-Ｚ]+|[々〆〤]+'
            expect(isTranslatable('😂')).toBeFalsy()
        })
    })
})
