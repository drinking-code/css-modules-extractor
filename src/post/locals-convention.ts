export type LocalsConventionFunction = (
    originalClassName: string,
    generatedClassName: string,
    inputFile: string
) => string;

export function conventionaliseLocals(names: { [local: string]: string }, options: {
    localsConvention?: "camelCase" | "camelCaseOnly" | "dashes" | "dashesOnly" | LocalsConventionFunction;
}) {

    return names
}
