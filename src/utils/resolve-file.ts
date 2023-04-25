import * as fs from 'fs'
import * as path from 'path'

let projectRoot = path.dirname((new URL(import.meta.url ?? 'file://' + __filename)).pathname)
while (!fs.readdirSync(projectRoot).includes('node_modules')) {
    if (projectRoot === '/') break
    projectRoot = path.join(projectRoot, '..')
}
const resolveProjectRoot = path.join.bind(null, projectRoot)
const projectPackageJson = JSON.parse(fs.readFileSync(resolveProjectRoot('package.json'), 'utf8'))
type GenericRecursiveObject = { [p: string]: string | GenericRecursiveObject | (string | GenericRecursiveObject)[] }
type PackageJsonType = {
    main?: string,
    module?: string
} & GenericRecursiveObject
const modulePackageJsons: Map<string, PackageJsonType> = new Map()

function getModulePackageJson(modulePath: string) {
    if (!modulePackageJsons.has(modulePath)) {
        modulePackageJsons.set(modulePath, JSON.parse(fs.readFileSync(path.join(modulePath, 'package.json'), 'utf8')))
    }
    return modulePackageJsons.get(modulePath)
}

const resolvedImports: Map<string, string> = new Map()

export function resolveImportFileSpecifier(base: string, fileSpecifier: string) {
    const key = base + fileSpecifier
    if (resolvedImports.has(key))
        return resolvedImports.get(key)

    let resolvedPath
    if (fileSpecifier.startsWith('#')) {
        if ('imports' in projectPackageJson)
            resolvedPath = resolveProjectRoot(projectPackageJson.imports[fileSpecifier])
    } else if (fileSpecifier.startsWith('.')) {
        resolvedPath = resolveFile(base, fileSpecifier)
    } else {
        if ((fileSpecifier.startsWith('@') && fileSpecifier.split('/').length === 2) || !fileSpecifier.includes('/')) {
            const modulePath = resolveProjectRoot('node_modules', fileSpecifier)
            const modulePackageJson = getModulePackageJson(modulePath)
            const mainPath = modulePackageJson.main ?? modulePackageJson.module ?? 'index'
            resolvedPath = resolveFile(modulePath, mainPath)
        } else {
            resolvedPath = resolveFile(resolveProjectRoot('node_modules'), fileSpecifier)
        }
    }
    resolvedImports.set(key, resolvedPath)
    return resolvedPath
}

const possibleNames = ['index']
export const possibleExtensions = ['.scss', '.css']

export function resolveFile(basePath: string, file: string): string {
    const resolvedFilePath = path.join(basePath, file)

    if (isExistingFile(resolvedFilePath))
        return resolvedFilePath

    const resolvedPathWithExtension = checkPossibleExtensionsForPath(resolvedFilePath)
    if (resolvedPathWithExtension)
        return resolvedPathWithExtension

    const resolvedFilePathWithUnderscore = path.join(path.dirname(resolvedFilePath), '_' + path.basename(resolvedFilePath))
    const resolvedPathWithUnderscoreAndExtension = checkPossibleExtensionsForPath(resolvedFilePathWithUnderscore)
    if (resolvedPathWithUnderscoreAndExtension)
        return resolvedPathWithUnderscoreAndExtension

    for (const possibleName of possibleNames) {
        const resolvedPathWithNameAndExtension =
            checkPossibleExtensionsForPath(path.join(resolvedFilePath, possibleName))
        if (resolvedPathWithNameAndExtension)
            return resolvedPathWithNameAndExtension
    }
}

function checkPossibleExtensionsForPath(path: string): string | false {
    for (const possibleExtension of possibleExtensions) {
        const pathWithExtension = path + possibleExtension
        if (isExistingFile(pathWithExtension)) {
            return pathWithExtension
        }
    }
    return false
}

function isExistingFile(path: string): boolean {
    return fs.existsSync(path) && fs.statSync(path).isFile()
}
