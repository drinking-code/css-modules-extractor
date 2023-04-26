import {fakeTokenizer, type TokenType} from '../utils/files.js'
import {getSelectors, type ImportData, type Selector} from './get-selectors.js'
import type LocalVars from './local-vars.js'

export function collectEach(tokenizer, parentSelector: Selector, seenImports: ImportData[], fileName: string, localVars: LocalVars) {
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
            collectLoop(tokenizer, over, as, parentSelector, seenImports, fileName, localVars)
            break
        }
    }
}

export function collectFor(tokenizer, parentSelector: Selector) {

}

function collectLoop(tokenizer, over: string, as: string | string[], parentSelector: Selector, seenImports: ImportData[], fileName: string, localVars: LocalVars) {
    let bracketLevel = 1
    const tokens: TokenType[] = []
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        tokens.push(token)
        if (token[1] === '{') {
            bracketLevel++
        } else if (token[1] === '}') {
            bracketLevel--
            if (bracketLevel === 0)
                break
        }
    }
    parentSelector.children ??= []
    const lengthBefore = parentSelector.children.length
    getSelectors(fakeTokenizer(tokens), parentSelector.children, seenImports, fileName, localVars)
    const lengthAfter = parentSelector.children.length
    for (let i = 0; i < lengthAfter - lengthBefore; i++) {
        parentSelector.children[lengthAfter - 1 - i].loopOver = over
        parentSelector.children[lengthAfter - 1 - i].loopAs = as
    }
}
