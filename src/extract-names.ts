import * as path from 'path'

import {type ImportData, type Selector} from './get-selectors.js'
import {spaceSymbol} from './trim-sentence.js'
import {globalImport} from './collect-import.js'
import {readFile, tokenizeExpression} from './files.js'
import {resolveImportFileSpecifier} from './resolve-file.js'

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

function evaluateExpression(expression: string, seenImports: ImportData[], fileName: string): string {
    let evaluatedExpression = ''
    const tokenizer = tokenizeExpression(expression)
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        if (token[0] === 'word') {
            const isUnscopedVariable = token[1].startsWith('$')
            const isScopedVariable = token[1].includes('.$')
            // console.log(token[1], isScopedVariable, isUnscopedVariable)
            if (isUnscopedVariable || isScopedVariable) {
                const namespace = isUnscopedVariable
                    ? globalImport
                    : token[1].substring(0, token[1].indexOf('.$'))
                const variableName = isUnscopedVariable
                    ? token[1]
                    : token[1].substring(token[1].indexOf('.$') - 1)
                evaluatedExpression += resolveVariable(variableName, namespace, seenImports, fileName).toString()
            }
        }
    }
    return expression
}

function resolveVariable(variableName: string, namespace: string | typeof globalImport, seenImports: ImportData[], fileName: string): any {
    seenImports
        .forEach(importData => {
            if (importData.nameSpace !== namespace) return
            const basePath = path.dirname(fileName)
            const filePath = resolveImportFileSpecifier(basePath, importData.file)
            console.log(readFile(filePath))
        })
    // console.log(variableName, importsToCheck)
    return variableName
}

function scanFileForVariables() {

}
