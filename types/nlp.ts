export type command = {
    text: string,
    file?: {
        name: string,
        file: Buffer
    }
}