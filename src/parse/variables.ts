import * as path from 'path'

import {collectImport, type globalImport} from './collect-import.js'
import {type ImportData} from './get-selectors.js'
import {resolveImportFileSpecifier} from '../utils/resolve-file.js'
import {evaluateTokenizedExpression} from './evaluate-expression.js'
import {fakeTokenizer, tokenizeFile, type TokenType} from '../utils/files.js'
import {trimTokens} from './trim-sentence.js'

export function resolveVariable(variableName: string, namespace: string | typeof globalImport, seenImports: ImportData[], fileName: string): any {
    for (const importData of seenImports) {
        if (importData.nameSpace !== namespace) continue
        const basePath = path.dirname(fileName)
        const filePath = resolveImportFileSpecifier(basePath, importData.file)
        const variables = scanFileForVariables(filePath, importData.type === 'import')
        if (variableName in variables) {
            const variableValueTokens = trimTokens(variables[variableName])
            return evaluateTokenizedExpression(fakeTokenizer(variableValueTokens), seenImports, fileName)
        }
    }
    return ''
}

type VariablesType = { [p: string]: TokenType[] }
const fileVariablesMap: Map<string, VariablesType> = new Map()

export function scanFileForVariables(filePath: string, followUse: boolean = false): VariablesType {
    if (fileVariablesMap.has(filePath))
        return fileVariablesMap.get(filePath)

    const tokenizer = tokenizeFile(filePath)
    const variables: VariablesType = {}
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        // console.log(token)
        if (token[0] === 'at-word') {
            if (token[1] === '@import' || (token[1] === '@use' && followUse) || token[1] === '@forward') { // todo: i dont know if this is right
                const importData: Partial<ImportData> = {
                    type: token[1].substring(1) as ImportData['type']
                }
                collectImport(tokenizer, importData)
                const basePath = path.dirname(filePath)
                const fileVariables = scanFileForVariables(resolveImportFileSpecifier(basePath, importData.file))
                Object.assign(variables, fileVariables)
            }
        } else if (token[0] === 'word') {
            if (token[1].startsWith('$')) {
                let variableValue
                while (!tokenizer.endOfFile()) {
                    const token = tokenizer.nextToken()
                    // console.log(token)
                    if (token[0] === ':') {
                        variableValue = []
                    } else if (token[0] === ';') {
                        break
                    } else {
                        variableValue?.push(token)
                    }
                }
                variables[token[1]] = variableValue
            }
        }
    }
    fileVariablesMap.set(filePath, variables)
    return variables
}
