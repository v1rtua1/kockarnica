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
        case "egypt-slots":
            return playEgyptSlots(bet, params)
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

// --- Egypt Slots Logic ---
function playEgyptSlots(bet: number, params: { lines?: number }): GameResult {
    const linesToPlay = Math.max(1, Math.min(10, params.lines || 10))
    const betPerLine = bet / linesToPlay // Bet is total bet passed from frontend usually, but let's assume bet is TOTAL bet. 
    // Actually in classic-slots we did: betPerLine = bet / linesToPlay.
    // Let's stick to that convention.

    const symbols = [
        "📖", // Wild/Scatter (Highest)
        "🤴", // Pharaoh
        "🐕", // Anubis
        "🪲", // Scarab
        "☥", // Ankh
        "🅰️", // A
        "🇰", // K
        "🇶", // Q
        "🇯", // J
        "🔟"  // 10
    ]

    // RIGGED LOGIC: 40% Win Rate
    const rand = Math.random()
    const forceLoss = rand < 0.6
    const forceWin = !forceLoss

    // Define 10 Paylines (5x3 grid)
    // 0 1 2 3 4
    // 5 6 7 8 9
    // 10 11 12 13 14
    // Using {r, c} format
    const paylines = [
        // 1. Middle
        [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }],
        // 2. Top
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }],
        // 3. Bottom
        [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }],
        // 4. V Shape (Top to Bottom to Top) 0,6,12,8,4
        [{ r: 0, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 2 }, { r: 1, c: 3 }, { r: 0, c: 4 }],
        // 5. Inverted V (Bottom to Top to Bottom) 10,6,2,8,14
        [{ r: 2, c: 0 }, { r: 1, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 3 }, { r: 2, c: 4 }],
        // 6. Top Two, Middle (0, 1, 7, 3, 4) - Simplified zig zags
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }],
        // 7. Bottom Two, Middle
        [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }],
        // 8. Middle Two, Top
        [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }],
        // 9. Middle Two, Bottom
        [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }],
        // 10. Center Column mix
        [{ r: 1, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 2 }, { r: 0, c: 3 }, { r: 1, c: 4 }]
    ]

    let grid: string[][] = []
    let totalPayout = 0
    let winningLines: number[] = []

    if (forceLoss) {
        // Generate grid until no wins
        let attempts = 0
        do {
            grid = Array.from({ length: 3 }, () =>
                Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)])
            )

            let hasWin = false
            for (let i = 0; i < linesToPlay; i++) {
                const line = paylines[i]
                // Check first 3 at least for a win
                const s1 = grid[line[0].r][line[0].c]
                const s2 = grid[line[1].r][line[1].c]
                const s3 = grid[line[2].r][line[2].c]
                // Wild card logic could go here, but simple matching for now
                if (s1 === s2 && s2 === s3) {
                    hasWin = true
                    break
                }
            }
            if (!hasWin) break
            attempts++
        } while (attempts < 100)
    } else {
        // Force Win
        // 1. Random Grid
        grid = Array.from({ length: 3 }, () =>
            Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)])
        )

        // 2. Pick a line
        const lineIndex = Math.floor(Math.random() * linesToPlay)
        const lineToWin = paylines[lineIndex]

        // 3. Pick symbol (weighted towards low pay)
        // 50% low pay, 50% high pay
        const isHigh = Math.random() > 0.5
        const possibleSymbols = isHigh ? symbols.slice(0, 5) : symbols.slice(5)
        const winningSymbol = possibleSymbols[Math.floor(Math.random() * possibleSymbols.length)]

        // 4. Set at least 3 in a row
        const matchCount = 3 + Math.floor(Math.random() * 3) // 3, 4, or 5
        for (let i = 0; i < Math.min(matchCount, 5); i++) {
            grid[lineToWin[i].r][lineToWin[i].c] = winningSymbol
        }
    }

    // Calculate Payout properly
    for (let i = 0; i < linesToPlay; i++) {
        const line = paylines[i]
        const lineSymbols = line.map(pos => grid[pos.r][pos.c])

        // Check for matches from left to right
        let matchLen = 1
        for (let j = 1; j < 5; j++) {
            if (lineSymbols[j] === lineSymbols[0]) {
                matchLen++
            } else {
                break
            }
        }

        if (matchLen >= 3) {
            const sym = lineSymbols[0]
            let multiplier = 0

            // Base Multipliers
            const baseMult = {
                "📖": 50, "🤴": 40, "🐕": 30, "🪲": 25, "☥": 20,
                "🅰️": 10, "🇰": 8, "🇶": 6, "🇯": 4, "🔟": 2
            } as any

            // Increase multiplier for longer matches
            let mult = (baseMult[sym] || 1)
            if (matchLen === 4) mult *= 2
            if (matchLen === 5) mult *= 5

            totalPayout += betPerLine * mult
            winningLines.push(i + 1)
        }
    }

    return {
        payout: totalPayout,
        result: { grid, winningLines }
    }
}
