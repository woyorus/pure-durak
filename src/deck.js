import "babel-polyfill"
import { ranks, suits, makeCard } from './card'

export function generateDeck() {
    let deck = []
    let gen = makeDeckGen()
    for (let card of gen) {
        deck.push(card)
    }
    return deck
}

// Impure
export function shuffleDeck(deck) {
    let counter = deck.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = deck[counter];
        deck[counter] = deck[index];
        deck[index] = temp;
    }
    return deck;
}

function* makeDeckGen() {
    let suit = 0
    let rank = 0
    while (suit < suits.length) {
        while (rank < ranks.length) {
            yield makeCard(suit, rank)
            rank++
        }
        rank = 0
        suit++
    }
}
