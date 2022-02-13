export const sanitizerTags = ['sh', 'su']

function sanitizeHashtags(text: string): string {
    // Replace hashtags as we do not want to translate them
    const hashTagRegex = /(#[^ !@#$%^&*(),.?":{}|<>]*)/g;
    const replacement = '<sh>$1</sh>';
    return text.replace(hashTagRegex, replacement);
}

function sanitizeUsers(text: string): string {
    const regex = /(?<!\w)@([\w+]{1,15})\b/g;
    const replacement = '<su>$1</su>';
    return text.replace(regex, replacement);
}

export function unsanitizeTweetText(tweetText: string): string {
    for (const tag of sanitizerTags) {
        tweetText = tweetText.replace(
            new RegExp(`(?:<${tag}>(.*?)<\/${tag}>)`, 'g'),
            '$1'
        )
    }
    return tweetText
}

export function sanitizeTweet(text: string): string {
    let sanitizedText = text
    sanitizedText = sanitizeHashtags(sanitizedText)
    sanitizedText = sanitizeUsers(sanitizedText)

    return sanitizedText
}
