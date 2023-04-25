import * as path from 'path'

import {collectImport, globalImport} from './collect-import.js'
import {type ImportData} from './get-selectors.js'
import {resolveImportFileSpecifier} from '../utils/resolve-file.js'
import {evaluateTokenizedExpression} from './evaluate-expression.js'
import {fakeTokenizer, tokenizeFile, type Tokenizer, type TokenType} from '../utils/files.js'
import {trimTokens} from './trim-sentence.js'
import type LocalVars from './local-vars.js'
import {isLocalVars} from './local-vars.js'

export function resolveVariable(variableName: string, namespace: string | typeof globalImport, seenImports: ImportData[], fileName: string, localVars: LocalVars, scope: number): any {
    if (namespace === globalImport && localVars.has(variableName, scope))
        return localVars.get(variableName, scope)

    for (const importData of seenImports) {
        if (importData.nameSpace !== namespace) continue
        const basePath = path.dirname(fileName)
        const filePath = resolveImportFileSpecifier(basePath, importData.file)
        const variables = scanFileForVariables(filePath, importData.type === 'import')
        if (variableName in variables) {
            const variableValueTokens = trimTokens(variables[variableName])
            return evaluateTokenizedExpression(fakeTokenizer(variableValueTokens), seenImports, fileName, localVars, scope)
        }
    }
    return ''
}

type VariablesType = { [p: string]: TokenType[] }
const fileVariablesMap: Map<string, VariablesType> = new Map()

export function scanFileForVariables(filePath: string, followUse: boolean = false, variables?: VariablesType): VariablesType {
    if (fileVariablesMap.has(filePath))
        return fileVariablesMap.get(filePath)

    const tokenizer = tokenizeFile(filePath)
    variables ??= {}
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        if (token[1] === '@import' || (token[1] === '@use' && followUse) || token[1] === '@forward') { // todo: i dont know if this is right
            const importData: Partial<ImportData> = {
                type: token[1].substring(1) as ImportData['type']
            }
            collectImport(tokenizer, importData)
            if (importData.nameSpace !== globalImport)
                continue
            const basePath = path.dirname(filePath)
            const fileVariables = scanFileForVariables(resolveImportFileSpecifier(basePath, importData.file), false, variables)
            Object.assign(variables, fileVariables)
        } else if (token[0] === 'word') {
            collectPossibleVariable(tokenizer, token, variables)
        }
    }
    fileVariablesMap.set(filePath, variables)
    return variables
}

export function collectPossibleVariable<VT extends VariablesType | LocalVars = VariablesType | LocalVars>(tokenizer: Tokenizer, token: TokenType, variables: VT, scope?: VT extends LocalVars ? number : never): boolean {
    if (token[1].startsWith('$')) {
        let variableValue
        while (!tokenizer.endOfFile()) {
            const token = tokenizer.nextToken()
            if (token[0] === ':') {
                variableValue = []
            } else if (token[0] === ';') {
                break
            } else {
                variableValue?.push(token)
            }
        }
        if (variableValue) {
            if (isLocalVars(variables)) {
                variables.add(token[1], variableValue, scope)
            } else {
                variables[token[1]] = variableValue
            }
            return true
        }
    }
    return false
}
