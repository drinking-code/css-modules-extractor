import path from 'path'

import {fakeTokenizer, tokenizeFile, type TokenType} from '../utils/files.js'
import {collectImport, globalImport} from './collect-import.js'
import {getSelectors, type ImportData, type Selector} from './get-selectors.js'
import {resolveImportFileSpecifier} from '../utils/resolve-file.js'
import {trimTokens} from './trim-sentence.js'

export function resolveMixin(mixinName: string, namespace: string | typeof globalImport, parentSelector: Selector, seenImports: ImportData[], fileName: string): any {
    for (const importData of seenImports) {
        if (importData.nameSpace !== namespace) continue
        const basePath = path.dirname(fileName)
        const filePath = resolveImportFileSpecifier(basePath, importData.file)
        const mixins = scanFileForMixins(filePath)
        if (mixinName in mixins) {
            const variableValueTokens = trimTokens(mixins[mixinName])
            parentSelector.children ??= []
            getSelectors(fakeTokenizer(variableValueTokens), parentSelector.children, seenImports, fileName)
            break
        }
    }
}

type MixinsType = { [p: string]: TokenType[] }

export function scanFileForMixins(filePath: string): MixinsType {
    const tokenizer = tokenizeFile(filePath)

    const mixins: MixinsType = {}
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        if (token[1] === '@import' || token[1] === '@forward') {
            const importData: Partial<ImportData> = {
                type: token[1].substring(1) as ImportData['type']
            }
            collectImport(tokenizer, importData)
            if (importData.nameSpace !== globalImport)
                continue
            const basePath = path.dirname(filePath)
            const fileMixins = scanFileForMixins(resolveImportFileSpecifier(basePath, importData.file))
            Object.assign(mixins, fileMixins)
        } else if (token[1] === '@mixin') {
            // collect mixin
            let bracketLevel = 0
            let mixinName = '', mixinArgs = '', mixinValue: TokenType[] = []
            // todo: impl args
            while (!tokenizer.endOfFile()) {
                const token = tokenizer.nextToken()
                if (bracketLevel === 0) {
                    if (token[0] === 'word') {
                        mixinName = token[1]
                    } else if (token[0] === 'brackets') {
                        mixinArgs = token[1]
                    }
                } else {
                    mixinValue.push(token)
                }
                if (token[0] === '{') {
                    bracketLevel++
                } else if (token[0] === '}') {
                    bracketLevel--
                    if (bracketLevel === 0) {
                        mixins[mixinName] = mixinValue
                        break
                    }
                }
            }
        }
    }
    return mixins
}
