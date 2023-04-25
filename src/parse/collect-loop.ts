export function collectEach(tokenizer) {
    let over: string, as: string | string[]
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        if (token[0] === 'word') {
            if (over !== null) {
                if (token[1] === 'in') {
                    over = null
                } else {
                    if (Array.isArray(as) && token[1] !== ',') {
                        as?.push(token[1])
                    } else if (token[1] === ',' && !Array.isArray(as)) {
                        as = [as]
                    } else if (token[1] !== ',' && !Array.isArray(as)) {
                        as = token[1]
                    }
                }
            } else {
                over = token[1]
            }
        } else if (token[1] === '{') {
            break
            // collectLoop(tokenizer, [])
        }
    }
    console.log(over, as)
}

export function collectFor(tokenizer) {

}

function collectLoop(tokenizer, over: string, as: string | string[]) {

}
