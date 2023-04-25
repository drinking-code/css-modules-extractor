export function collectEach(tokenizer) {
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        console.log(token)
        if (token[1] === '@import' || token[1] === '@forward') {
        } else if (token[1] === '{') {
            collectLoop(tokenizer, [])
        }
    }
}

export function collectFor(tokenizer) {

}

function collectLoop(tokenizer, over: []) {

}
