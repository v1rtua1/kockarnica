import { randomBytes } from "crypto"

export class GameEngine {
    /**
     * Generates a random integer between min (inclusive) and max (inclusive)
     * using cryptographically secure random number generation.
     */
    static getRandomInt(min: number, max: number): number {
        const range = max - min + 1
        const bytesNeeded = Math.ceil(Math.log2(range) / 8)
        const maxBytes = Math.pow(256, bytesNeeded)
        const keep = maxBytes - (maxBytes % range)

        while (true) {
            const bytes = randomBytes(bytesNeeded)
            let value = 0
            for (let i = 0; i < bytesNeeded; i++) {
                value = (value << 8) + bytes[i]
            }

            if (value < keep) {
                return min + (value % range)
            }
        }
    }

    /**
     * Shuffles an array using Fisher-Yates algorithm with secure RNG.
     */
    static shuffle<T>(array: T[]): T[] {
        const newArray = [...array]
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = this.getRandomInt(0, i)
                ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
        }
        return newArray
    }
}
