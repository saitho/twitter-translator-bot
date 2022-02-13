export function normalizeLanguageCode(languageCode: string): string {
    return languageCode.toUpperCase().replace('_', '-')
}

export function getFlag(targetLanguage: string): string {
    targetLanguage = normalizeLanguageCode(targetLanguage)
    const flags: {[languageCode: string]: string} = {
        BG: '🇧🇬',
        CS: '🇨🇿',
        DA: '🇩🇰',
        DE: '🇩🇪',
        EL: '🇬🇷',
        'EN-GB': '🇬🇧',
        'EN-US': '🇺🇸',
        EN: '🇬🇧',
        ES: '🇪🇸',
        ET: '🇪🇪',
        FI: '🇫🇮',
        FR: '🇫🇷',
        HU: '🇭🇺',
        IT: '🇮🇹',
        JA: '🇯🇵',
        LT: '🇱🇹',
        LV: '🇱🇻',
        NL: '🇳🇱',
        PL: '🇵🇱',
        'PT-PT': '🇵🇹',
        'PT-BR': '🇧🇷',
        PT: '🇵🇹',
        RO: '🇷🇴',
        RU: '🇷🇺',
        SK: '🇸🇰',
        SL: '🇸🇮',
        SV: '🇸🇪',
        ZH: '🇨🇳',
    }
    if (Object.keys(flags).indexOf(targetLanguage) === -1) {
        return ''
    }
    return flags[targetLanguage]
}
