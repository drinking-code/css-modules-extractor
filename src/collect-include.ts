export function collectInclude(tokenizer) {
    let hasBrackets = false
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        if (token[0] === '{') {
            hasBrackets = true
        } else if ((hasBrackets && token[0] === '}') || (!hasBrackets && token[0] === ';')) {
            break
        }
    }
}
