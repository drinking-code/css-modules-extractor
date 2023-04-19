import * as path from 'path'

import {type ImportData, type Selector} from './get-selectors.js'
import {spaceSymbol} from './trim-sentence.js'
import {evaluateExpression} from './evaluate-expression.js'

const lastSelectorPart = (fullSelector: string): string => fullSelector.substring(fullSelector.lastIndexOf(' ') + 1)

export function extractNames(selectors: Selector[], seenImports: ImportData[], fileName: string, names: {[local: string]: string}, parentSelector: string = '') {
    for (const selector of selectors) {
        // evaluate expressions only if after space, at position 0, or inside class / id
        let currentSelectorString = ''
        // let startsWithAmp = selector.content[0][0] === '&'
        for (let i = 0; i < selector.content.length; i++) {
            if (selector.content[i] === spaceSymbol) continue
            while ((selector.content[i] as string).includes('&')) {
                const ampIndex = (selector.content[i] as string).indexOf('&')
                selector.content[i] =
                    (selector.content[i] as string).substring(0, ampIndex) + parentSelector + (selector.content[i] as string).substring(ampIndex + 1)
            }

            const word = selector.content[i]
            if (word === spaceSymbol) {
                currentSelectorString += ' '
            } else if (word.startsWith('#{') &&
                (i === 0 || selector.content[i - 1] === spaceSymbol ||
                    lastSelectorPart(currentSelectorString).startsWith('.') ||
                    lastSelectorPart(currentSelectorString).startsWith('#'))
            ) {
                currentSelectorString += evaluateExpression(word.slice(2, -1), seenImports, fileName)
            } else {
                currentSelectorString += word
            }
        }
        // if (!startsWithAmp && parentSelector)
        //     currentSelectorString = parentSelector + ' ' + currentSelectorString

        let name = ''
        for (let i = currentSelectorString.length - 1; i >= 0; i--) {
            const char = currentSelectorString[i]
            name = char + name
            if (char === '#' || char === '.') {
                if (!(name in names))
                    names[name.substring(1)] = name
                name = ''
            } else if (char === ' ' || char === ',') {
                name = ''
            }
        }

        if (selector.children && selector.children.length > 0)
            extractNames(selector.children, seenImports, fileName, names, currentSelectorString)
    }
}
