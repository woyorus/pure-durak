export const suits = ['spades', 'clubs', 'diamonds', 'hearts']
export const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export function makeCard(suit, rank) {
    return { suit, rank }
}

export function stringifyCard(card) {
    return `${ranks[card.rank]} of ${suits[card.suit]}`
}

/** Returns true if attacking card beats defending card */
export function beats(defending, attacking, trumpSuit) {
    if (attacking.suit === trumpSuit && defending.suit !== trumpSuit) {
        return true
    } else if (attacking.suit === defending.suit) {
        if (attacking.rank > defending.rank) {
            return true
        }
    }
    return false
}
