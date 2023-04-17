import * as path from 'path'

import {type ImportData, type Selector} from './get-selectors.js'
import {spaceSymbol} from './trim-sentence.js'
import {evaluateExpression} from './evaluate-expression.js'

const lastSelectorPart = (fullSelector: string): string => fullSelector.substring(fullSelector.lastIndexOf(' ') + 1)

export function extractNames(selectors: Selector[], seenImports: ImportData[], fileName: string) {
    for (const selector of selectors) {
        // console.log(selector)
        // evaluate expressions only if after space, at position 0, or inside class / id
        let currentSelectorString = ''
        selector.content.forEach((word, index) => {
            if (word === spaceSymbol) {
                currentSelectorString += ' '
            } else if (word.startsWith('#{') &&
                (index === 0 || selector.content[index - 1] === spaceSymbol ||
                    lastSelectorPart(currentSelectorString).startsWith('.') ||
                    lastSelectorPart(currentSelectorString).startsWith('#'))
            ) {
                currentSelectorString += evaluateExpression(word.slice(2, -1), seenImports, fileName)
            } else {
                currentSelectorString += word
            }
        })
        // console.log(currentSelectorString)
    }
}
