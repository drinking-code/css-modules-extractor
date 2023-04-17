import {tokenizeExpression, type Tokenizer} from './files.js'
import {type ImportData} from './get-selectors.js'
import {globalImport} from './collect-import.js'
import {resolveVariable} from './variables.js'


export function evaluateExpression(expression: string, seenImports: ImportData[], fileName: string): string {
    return evaluateTokenizedExpression(tokenizeExpression(expression), seenImports, fileName)
}

export function evaluateTokenizedExpression(tokenizer: Tokenizer, seenImports: ImportData[], fileName: string): string {
    let evaluatedExpression = ''
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
        } else if (token[0] === 'string') {
            evaluatedExpression += token[1].slice(1, -1)
        }
    }
    console.log(evaluatedExpression)
    return evaluatedExpression
}
