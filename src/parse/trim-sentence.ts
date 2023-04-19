import {type Sentence} from './get-selectors.js'
import {type TokenType} from '../utils/files.js'

export const spaceSymbol = Symbol.for('space')

export function trimSentence(sentence: Sentence) {
    while (sentence[0] === spaceSymbol) {
        sentence.shift()
    }
    while (sentence[sentence.length - 1] === spaceSymbol) {
        sentence.pop()
    }
    return sentence
}

export function trimTokens(sentence: TokenType[]) {
    while (sentence[0][0] === 'space') {
        sentence.shift()
    }
    while (sentence[sentence.length - 1][0] === 'space') {
        sentence.pop()
    }
    return sentence
}
