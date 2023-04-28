import {type ImportData, type Selector} from './get-selectors.js'
import {spaceSymbol, trimSentence} from './trim-sentence.js'
import {evaluateExpression} from './evaluate-expression.js'
import type LocalVars from './local-vars.js'
import {resolveVariable} from './variables.js'
import {globalImport} from './collect-import.js'
import {parseList} from './parse-list.js'

export function extractNames(selectors: Selector[], seenImports: ImportData[], fileName: string,
                             names: { [local: string]: string }, localVars: LocalVars, parentSelector: string = '') {
    for (const selector of selectors) {
        // evaluate expressions only if after space, at position 0, or inside class / id
        let currentSelectorString: string | string[] = ''
        let loopOver
        if ('loopOver' in selector) {
            if (typeof selector.loopOver === 'string' && (selector.loopOver.startsWith('$') || selector.loopOver.includes('.$'))) {
                loopOver = resolveVariable(selector.loopOver, globalImport, seenImports, fileName, localVars, selector.scopeId)
                trimSentence(loopOver)
                parseList(loopOver)
                currentSelectorString = Array(loopOver.length).fill('')
            } else {
                loopOver = selector.loopOver
            }
        }
        for (let i = 0; i < selector.content.length; i++) {
            if (selector.content[i] !== spaceSymbol) {
                while ((selector.content[i] as string).includes('&')) {
                    const ampIndex = (selector.content[i] as string).indexOf('&')
                    selector.content[i] =
                        (selector.content[i] as string).substring(0, ampIndex) + parentSelector + (selector.content[i] as string).substring(ampIndex + 1)
                }
            }
            const word = selector.content[i]
            if (loopOver) {
                for (let loopIndex = 0; loopIndex < loopOver.length; loopIndex++) {
                    const loopElement = loopOver[loopIndex]
                    if (typeof selector.loopAs === 'string') {
                        localVars.add(selector.loopAs, loopElement, selector.scopeId)
                        ;(currentSelectorString as string[])[loopIndex] =
                            buildSelectorString(word, currentSelectorString[loopIndex], i, selector, seenImports, fileName, localVars)
                        localVars.removeVar(selector.loopAs, selector.scopeId)
                    } else {
                        // console.warn('Destructuring not implemented.')
                    }
                }
            } else {
                currentSelectorString = buildSelectorString(word, currentSelectorString as string, i, selector, seenImports, fileName, localVars)
            }
        }

        if (Array.isArray(currentSelectorString)) {
            for (const currentSelectorStringEntry of currentSelectorString) {
                extractNamesFromSelectorString(currentSelectorStringEntry, names, selector, seenImports, fileName, localVars)
            }
        } else {
            extractNamesFromSelectorString(currentSelectorString, names, selector, seenImports, fileName, localVars)
        }
    }
}

function extractNamesFromSelectorString(currentSelectorString: string, names: { [local: string]: string },
                                        selector: Selector, seenImports: ImportData[], fileName: string, localVars: LocalVars) {
    let name = ''

    for (let i = currentSelectorString.length - 1; i >= 0; i--) {
        const char = currentSelectorString[i]
        name = char + name
        if (char === '#' || char === '.') {
            if (!(name in names))
                names[name.substring(1)] = name
            name = ''
        } else if (char === ' ' || char === ',' || char === ':' || char === '(' || char === '+' || char === '>' || char === '~') {
            name = ''
        }
    }

    if (selector.children && selector.children.length > 0) {
        extractNames(selector.children, seenImports, fileName, names, localVars, currentSelectorString)
    }
}

const getLastSelectorPart = (fullSelector: string): string => fullSelector.substring(fullSelector.lastIndexOf(' ') + 1)

function lastSelectorPartStartsOrEndsWithDotOrNumberSymbol(currentSelectorString: string) {
    const lastSelectorPart = getLastSelectorPart(currentSelectorString)
    return lastSelectorPart.startsWith('.') || lastSelectorPart.startsWith('#')/* || lastSelectorPart.endsWith('.') || lastSelectorPart.endsWith('#')*/
}

function buildSelectorString(word: string | typeof spaceSymbol, currentSelectorString: string, i: number, selector: Selector,
                             seenImports: ImportData[], fileName: string, localVars: LocalVars): string {
    /*console.log(i, i === 0, selector.content[i - 1] === spaceSymbol, getLastSelectorPart(currentSelectorString),
        getLastSelectorPart(currentSelectorString).startsWith('.'), getLastSelectorPart(currentSelectorString).startsWith('#'))*/
    if (word === spaceSymbol) {
        currentSelectorString += ' '
    } else if (word.startsWith('#{') &&
        (i === 0 || selector.content[i - 1] === spaceSymbol || lastSelectorPartStartsOrEndsWithDotOrNumberSymbol(currentSelectorString))
    ) {
        currentSelectorString += evaluateExpression(word.slice(2, -1), seenImports, fileName, localVars, selector.scopeId)
    } else {
        currentSelectorString += word
    }
    return currentSelectorString
}
