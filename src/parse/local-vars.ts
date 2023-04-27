export default class LocalVars {
    /*private*/
    names: string[] = []
    private values: any[] = []
    private scopes: number[] = []

    add(name: string, value: any, scope: number = 0): void {
        this.names.push(name)
        this.values.push(value)
        this.scopes.push(scope)
    }

    has(name: string, scope: number): boolean {
        for (let i = 0; i < this.names.length; i++) {
            if (this.names[i] == name && this.scopes[i] <= scope) return true
        }
        return false
    }

    get(name: string, scope: number): any | void {
        let value: any, foundScope: number = 0
        for (let i = 0; i < this.names.length; i++) {
            if (this.names[i] == name && this.scopes[i] <= scope && this.scopes[i] >= foundScope) {
                foundScope = this.scopes[i]
                value = this.values[i]
            }
        }
        return value
    }

    removeScope(scope: number): void {
        for (let i = this.names.length - 1; i >= 0; i--) { // reverse to not skip values
            if (this.scopes[i] !== scope) continue
            delete this.names[i]
            delete this.values[i]
            delete this.scopes[i]
        }
    }

    removeVar(name: string, scope?: number): void {
        for (let i = this.names.length - 1; i >= 0; i--) { // reverse to not skip values
            if (this.names[i] !== name || (scope !== undefined && this.scopes[i] === scope)) continue
            delete this.names[i]
            delete this.values[i]
            delete this.scopes[i]
        }
    }
}

export function isLocalVars(value: any): value is LocalVars {
    return value && value.constructor === LocalVars
}
