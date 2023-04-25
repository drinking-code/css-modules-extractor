import {tokenizeExpression, type Tokenizer} from '../utils/files.js'
import {type ImportData} from './get-selectors.js'
import {globalImport} from './collect-import.js'
import {resolveVariable} from './variables.js'
import type LocalVars from './local-vars.js'


export function evaluateExpression(expression: string, seenImports: ImportData[], fileName: string, localVars: LocalVars, scope: number): string {
    return evaluateTokenizedExpression(tokenizeExpression(expression), seenImports, fileName, localVars, scope)
}

const operators = [['+', '-']]

export function evaluateTokenizedExpression(tokenizer: Tokenizer, seenImports: ImportData[], fileName: string, localVars: LocalVars, scope: number): string {
    let evaluatedExpression = ''
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        if (token[0] === 'word') {
            if (token[1] in operators) {
                evaluatedExpression += operators[token[1]]
                continue
            }
            const isUnscopedVariable = token[1].startsWith('$')
            const isScopedVariable = token[1].includes('.$')
            if (isUnscopedVariable || isScopedVariable) {
                const namespace = isUnscopedVariable
                    ? globalImport
                    : token[1].substring(0, token[1].indexOf('.$'))
                const variableName = isUnscopedVariable
                    ? token[1]
                    : token[1].substring(token[1].indexOf('.$') - 1)
                evaluatedExpression += resolveVariable(variableName, namespace, seenImports, fileName, localVars, scope).toString()
            }
        } else if (token[0] === 'string') {
            evaluatedExpression += token[1].slice(1, -1)
        }
    }
    // let evaluatedExpression = expressionList.join('')
    // todo: evaluate operators


    return evaluatedExpression
}
