import * as fs from 'fs'
import * as path from 'path'
import resolveFile from './resolve-file.js'

const importPattern = /@(use|import|forward) ?['"]([^'"]+)['"] *( as ([^ ]+))?? *;/g
const variablesPattern = /^\$([^ :]+):([^;]+);/gm
const singleLineCommentPattern = /\/\/.+$/gm
const multiLineCommentPattern = /\/\*(.|\n)*?\*\//g

// todo: includes

const readFiles: Map<string, string> = new Map()

function readFile(fileName: string): string {
    if (readFiles.has(fileName)) return readFiles.get(fileName)
    const fileContents = fs.readFileSync(fileName, 'utf8')
        .replace(multiLineCommentPattern, '')
        .replace(singleLineCommentPattern, '')
    readFiles.set(fileName, fileContents)
    return fileContents
}

type ImportDataType = {
    method: 'use' | 'import' | 'forward',
    importPath: string,
    as: string | undefined,
}
type GetNamesOptionsType = {
    importTypes?: ImportTypesListType
}

type ImportTypesListType = { use: boolean, import: boolean, forward: boolean }

function getImports(fileContents: string, types?: ImportTypesListType): ImportDataType[] {
    types ??= {} as ImportTypesListType
    types = {
        use: true,
        import: true,
        forward: true,
        ...types
    }
    const importsMatches = fileContents.matchAll(importPattern)
    const importsData: ImportDataType[] = []
    for (const match of importsMatches) {
        const [fullStatement, method, importPath, asStatement, as] = match
        if (!types[method]) continue
        importsData.push({
            method: method as ImportDataType['method'],
            importPath,
            as
        })
    }
    return importsData
}

export function getNames(fileName: string, options?: GetNamesOptionsType): string[] {
    fileName = path.resolve(fileName)
    const fileContents = readFile(fileName)
    const importsData = getImports(fileContents, options?.importTypes)
    const names = []
    let variables = {}
    for (const importData of importsData) {
        const {method, importPath, as} = importData
        if (importPath.startsWith('sass:')) continue
        const resolvedPath = resolveFile(path.dirname(fileName), importPath)
        let imported: ImportedDataType
        if (method === 'use') {
            imported = useImport(resolvedPath)
        } else if (method === 'import') {
            imported = importImport(resolvedPath)
        } else if (method === 'forward') {
            imported = forwardImport(resolvedPath)
        }
        const {names: importedNames, variables: importedVariables} = imported
        names.push(...importedNames)
        variables = {
            ...variables,
            ...importedVariables
        }
    }
    const lines = fileContents.matchAll(/[^#]{/g)
    console.log(Array.from(lines))
    // for (const lineIndex in lines) {
    //     const line = lines[lineIndex]
    //     if (line) {
    //     }
    // }
    return names
}

type VariableType = string
type ImportedDataType = { names: string[], variables: { [name: string]: VariableType } }

const globalImports = {import: true, forward: true, use: false}

function useImport(fileName: string): ImportedDataType {
    return abstractImport(fileName, {
        importTypes: globalImports
    })
}

function forwardImport(fileName: string): ImportedDataType {
    return abstractImport(fileName)
}

function importImport(fileName: string): ImportedDataType {
    return abstractImport(fileName)
}

function abstractImport(fileName: string, getNamesOptions?: GetNamesOptionsType): ImportedDataType {
    const names = getNames(fileName, getNamesOptions)
    const fileContents = readFile(fileName)
    const variables = Object.fromEntries(
        Array.from(fileContents.matchAll(variablesPattern)).map(match => {
            return [match[1], match[2]]
        })
    )
    return {names, variables}
}
