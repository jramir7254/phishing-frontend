const _KEY = "access_token";

interface TokenState {
    token: string | null
    get(): string | null
    set: (t: string) => void
    clear: () => void
}

export const tokenStore = <TokenState>{
    token: sessionStorage.getItem(_KEY),
    get: () => sessionStorage.getItem(_KEY),
    set: (t) => {
        sessionStorage.setItem(_KEY, t)

    },
    clear: () => {
        sessionStorage.removeItem(_KEY)
        localStorage.clear()
    },
}
