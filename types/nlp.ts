export type phrase = {
    key: string,
    phrase: string
}

export type command = {
    text: string,
    file?: {
        name: string,
        file: Buffer
    }
}