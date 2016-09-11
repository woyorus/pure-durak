export const suits = ['spades', 'clubs', 'diamonds', 'hearts']
export const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export function makeCard(suit, rank) {
    return { suit, rank }
}

export function stringifyCard(card) {
    return `${ranks[card.rank]} of ${suits[card.suit]}`
}
