import {tokenizeExpression, type Tokenizer} from '../utils/files.js'
import {type ImportData} from './get-selectors.js'
import {globalImport} from './collect-import.js'
import {resolveVariable} from './variables.js'


export function evaluateExpression(expression: string, seenImports: ImportData[], fileName: string): string {
    return evaluateTokenizedExpression(tokenizeExpression(expression), seenImports, fileName)
}

const operators = [['+', '-']]

export function evaluateTokenizedExpression(tokenizer: Tokenizer, seenImports: ImportData[], fileName: string): string {
    const expressionList = []
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        if (token[0] === 'word') {
            if (token[1] in operators) {
                expressionList.push(operators[token[1]])
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
                expressionList.push(resolveVariable(variableName, namespace, seenImports, fileName).toString())
            }
        } else if (token[0] === 'string') {
            expressionList.push(token[1].slice(1, -1))
        }
    }
    let evaluatedExpression = expressionList.join('')
    // todo: evaluate operators


    return evaluatedExpression
}
