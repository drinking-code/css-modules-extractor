import {type Sentence} from './get-selectors.js'

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
