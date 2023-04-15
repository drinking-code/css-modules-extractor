import * as path from 'path'
import * as fs from 'fs'

const possibleNames = ['index']
export const possibleExtensions = ['.scss', '.css']

export default function resolveFile(basePath: string, file: string): string {
    const resolvedFilePath = path.join(basePath, file)

    // todo: resolve symlinks

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
