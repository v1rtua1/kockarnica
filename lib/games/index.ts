export type GameResult = {
    payout: number
    result: any
}

export async function handleGamePlay(gameId: string, bet: number, params: any): Promise<GameResult> {
    switch (gameId) {
        case "keno":
            return playKeno(bet, params)
        case "classic-slots":
            return playClassicSlots(bet, params)
        default:
            throw new Error("Game not implemented")
    }
}

// --- Keno Logic ---
function playKeno(bet: number, params: { selectedNumbers: number[] }): GameResult {
    const { selectedNumbers } = params
    if (!selectedNumbers || selectedNumbers.length < 1 || selectedNumbers.length > 10) {
        throw new Error("Invalid selection")
    }

    // RIGGED LOGIC: 
    // 60% chance to force LOSS (0 matches)
    // 40% chance to force WIN (at least 2 matches)
    const rand = Math.random()
    const forceLoss = rand < 0.6
    const forceWin = !forceLoss

    // Draw 20 numbers (1-80)
    const drawnNumbers = new Set<number>()

    if (forceLoss) {
        // Generate numbers that definitely DON'T match
        const available = Array.from({ length: 80 }, (_, i) => i + 1).filter(n => !selectedNumbers.includes(n))
        while (drawnNumbers.size < 20 && available.length > 0) {
            const idx = Math.floor(Math.random() * available.length)
            drawnNumbers.add(available[idx])
            available.splice(idx, 1)
        }
    } else if (forceWin) {
        // Force at least 2 matches (minimum win condition)
        // Pick 2 numbers from selectedNumbers to guarantee a win
        const guaranteedMatches = 2
        const shuffledSelection = [...selectedNumbers].sort(() => 0.5 - Math.random())

        for (let i = 0; i < guaranteedMatches; i++) {
            if (i < shuffledSelection.length) {
                drawnNumbers.add(shuffledSelection[i])
            }
        }

        // Fill the rest with random numbers (avoiding duplicates)
        while (drawnNumbers.size < 20) {
            const num = Math.floor(Math.random() * 80) + 1
            drawnNumbers.add(num)
        }
    } else {
        // Fallback (shouldn't happen with current boolean logic, but good for safety)
        while (drawnNumbers.size < 20) {
            drawnNumbers.add(Math.floor(Math.random() * 80) + 1)
        }
    }

    const drawnArray = Array.from(drawnNumbers)

    // Count matches
    let matches = 0
    for (const num of selectedNumbers) {
        if (drawnNumbers.has(num)) matches++
    }

    // Calculate Payout (Simplified Paytable)
    let payout = 0
    if (matches === 0) payout = 0
    else if (matches === 1) payout = 0
    else if (matches === 2) payout = bet * 1
    else if (matches === 3) payout = bet * 2
    else if (matches === 4) payout = bet * 5
    else if (matches === 5) payout = bet * 10
    else if (matches >= 6) payout = bet * 50 // Big win

    return {
        payout,
        result: {
            drawnNumbers: drawnArray,
            matches,
            selectedNumbers
        }
    }
}

// --- Classic Slots Logic ---
function playClassicSlots(bet: number, params: { lines?: number }): GameResult {
    const linesToPlay = Math.max(1, Math.min(5, params.lines || 1))
    const betPerLine = bet / linesToPlay

    const symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "💎", "7️⃣"]

    // RIGGED LOGIC: 
    // 60% chance to force LOSS
    // 40% chance to force WIN
    const rand = Math.random()
    const forceLoss = rand < 0.6
    const forceWin = !forceLoss

    // Define lines (coordinates)
    const paylines = [
        [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }], // Middle (Line 1)
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }], // Top (Line 2)
        [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }], // Bottom (Line 3)
        [{ r: 0, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 2 }], // Diagonal TL-BR (Line 4)
        [{ r: 2, c: 0 }, { r: 1, c: 1 }, { r: 0, c: 2 }]  // Diagonal BL-TR (Line 5)
    ]

    let grid: string[][] = []
    let totalPayout = 0
    let winningLines: number[] = []

    if (forceLoss) {
        // Generate grid until no wins
        let attempts = 0
        do {
            grid = [
                [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
                [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
                [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]]
            ]

            // Check for wins
            let hasWin = false
            for (let i = 0; i < linesToPlay; i++) {
                const line = paylines[i]
                const s1 = grid[line[0].r][line[0].c]
                const s2 = grid[line[1].r][line[1].c]
                const s3 = grid[line[2].r][line[2].c]
                if (s1 === s2 && s2 === s3) {
                    hasWin = true
                    break
                }
            }
            if (!hasWin) break
            attempts++
        } while (attempts < 100)
    } else if (forceWin) {
        // Force at least one winning line
        // 1. Generate a random grid first
        grid = [
            [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
            [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
            [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]]
        ]

        // 2. Pick a line to force a win on (from the active lines)
        const lineIndex = Math.floor(Math.random() * linesToPlay)
        const lineToWin = paylines[lineIndex]

        // 3. Pick a winning symbol (bias towards lower paying symbols for frequent wins)
        // 🍒, 🍋, 🍊 are lower paying
        const winningSymbol = symbols[Math.floor(Math.random() * 3)]

        // 4. Set the grid positions
        grid[lineToWin[0].r][lineToWin[0].c] = winningSymbol
        grid[lineToWin[1].r][lineToWin[1].c] = winningSymbol
        grid[lineToWin[2].r][lineToWin[2].c] = winningSymbol
    }

    // Calculate Payout
    for (let i = 0; i < linesToPlay; i++) {
        const line = paylines[i]
        const s1 = grid[line[0].r][line[0].c]
        const s2 = grid[line[1].r][line[1].c]
        const s3 = grid[line[2].r][line[2].c]

        if (s1 === s2 && s2 === s3) {
            let multiplier = 0
            if (s1 === "7️⃣") multiplier = 100
            else if (s1 === "💎") multiplier = 50
            else if (s1 === "🔔") multiplier = 20
            else if (s1 === "🍇") multiplier = 15
            else if (s1 === "🍊") multiplier = 10
            else if (s1 === "🍋") multiplier = 5
            else if (s1 === "🍒") multiplier = 2

            totalPayout += betPerLine * multiplier
            winningLines.push(i + 1)
        }
    }

    return {
        payout: totalPayout,
        result: { grid, winningLines }
    }
}
