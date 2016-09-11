import {generateDeck, shuffleDeck} from './deck'
import {stringifyCard, beats} from './card'

import {
    ADD_PLAYER,
    START_ROUND,
    MAKE_ATTACK,
    MAKE_DEFENSE,
    DEFENSE_TAKE,
    DEFENSE_DONE
} from './actions'

const initialState = {
    roundInProgress: false,
    deck: [],
    trumpSuit: null,
    activePlayers: [],
    turnPointer: 0,
    table: [],
    doneCards: []
}

/** Reducer: (state, action) -> state */
export default function gameApp(state = initialState, action = {}) {
    switch (action.type) {

        case ADD_PLAYER:
            return addPlayerReducer(state, action)

        case START_ROUND:
            return startRoundReducer(state, action)

        case MAKE_ATTACK:
            return attackReducer(state, action)

        case MAKE_DEFENSE:
            return defenseReducer(state, action)

        case DEFENSE_TAKE:
            return defenseTakeReducer(state, action)

        case DEFENSE_DONE:
            return defenseDoneReducer(state, action)

        default:
            return state
    }
}

function addPlayerReducer(state, action) {
    if (state.activePlayers.length === 6) {
        console.warn('maximum number of players reached')
        return state
    }
    return Object.assign({}, state, {
        activePlayers: [
            ...state.activePlayers,
            {
                name: action.name,
                hand: []
            }
        ]
    })
}

function startRoundReducer(state, action) {
    if (state.activePlayers.length < 2) {
        console.warn('not enough players to start round')
        return state
    }

    let freshDeck = shuffleDeck(generateDeck())
    let trumpSuit;

    // Distribute cards among players
    for (let i = 0; i < 6; i++) {
        state.activePlayers.forEach(player => {
            let card = freshDeck.pop()
            // If deck gets empty already at the round start, the last card becomes trump
            if (freshDeck.length === 0) {
                trumpSuit = card.suit
            }
            player.hand.push(card)
        })
    }

    if (freshDeck.length !== 0) {
        // Select the topmost card as trump and place it in the back
        let trumpCard = freshDeck.pop()
        trumpSuit = trumpCard.suit
        freshDeck = [trumpCard].concat(freshDeck)
    }

    return Object.assign({}, state, {
        deck: freshDeck,
        activePlayers: state.activePlayers,
        trumpSuit,
        roundInProgress: true
    })
}

function attackReducer(state, action) {
    // If no cards are on the table, only turnPointer player can attack
    if (state.table.length === 0 && state.turnPointer !== action.playerId) {
        console.warn(`player ${action.playerId} cannot attack now`)
        return state
    }

    let attacker = state.activePlayers[action.playerId]
    let attackCard = attacker.hand[action.cardId]

    // Ensure that there's a same rank card already on the table if there are cards on table at all
    // (the very first card in attack round can be any suit/rank)
    if (state.table.length > 0) {
        if (!state.table.find(tableCard => tableCard.card.rank === attackCard.rank)) {
            console.warn(`cannot attack with card ${stringifyCard(attackCard)}`)
            return state
        }
    }

    let newHand = attacker.hand.filter(c => c !== attackCard)
    let newTable = [
        {card: attackCard, type: 'attack'},
        ...state.table
    ]
    let newState = Object.assign({}, state, {table: newTable})
    newState.activePlayers[action.playerId].hand = newHand
    return newState
}

function defenseReducer(state, action) {
    if (action.playerId !== getCurrentDefenderId(state)) {
        console.warn(`only defender can perform this action`)
        return state
    }

    let defender = state.activePlayers[action.playerId]
    let defenseCard = defender.hand[action.cardId]

    // Determine if the card beats any attacking card on the table
    let defendedCards = state.table
        .filter(tc => tc.type === 'attack')
        .filter(tc => beats(tc.card, defenseCard, state.trumpSuit))

    if (defendedCards.length === 0) {
        console.warn(`card ${stringifyCard(defenseCard)} cannot beat any card on the table`)
        return state
    }

    console.log(`${stringifyCard(defenseCard)} has beaten ${defendedCards.map(stringifyCard)}!`)

    let newHand = defender.hand.filter(c => c !== defenseCard)
    let newTable = [
        {card: defenseCard, type: 'defense'},
        ...state.table
    ]
    let newState = Object.assign({}, state, {table: newTable})
    newState.activePlayers[action.playerId].hand = newHand
    return newState
}

function defenseTakeReducer(state, action) {
    if (action.playerId !== getCurrentDefenderId(state)) {
        console.warn(`only defender can perform this action`)
        return state
    }
    let defender = state.activePlayers[action.playerId]
    let tableCards = state.table.map(c => c.card)
    let newHand = [...tableCards, ...defender.hand]
    let newState = Object.assign({}, state, {
        table: [],
        turnPointer: (state.turnPointer + 2) % state.activePlayers.length
    })
    newState.activePlayers[action.playerId].hand = newHand
    newState = distributeCards(newState, state.turnPointer)
    return newState
}

function defenseDoneReducer(state, action) {
    if (action.playerId !== getCurrentDefenderId(state)) {
        console.warn(`only defender can perform this action`)
        return state
    }

    if (verifyAttackDefended(state) === false) {
        console.warn(`attack is not yet defended by the defender`)
        return state
    }

    let newState = Object.assign({}, state, {
        table: [],
        doneCards: [...state.table.map(c => c.card), ...state.doneCards],
        turnPointer: (state.turnPointer + 1) % state.activePlayers.length
    })

    newState = distributeCards(newState, state.turnPointer)
    return newState
}

function getCurrentDefenderId(state) {
    // The defender is whoever sitting next to current attacker
    return (state.turnPointer + 1) % state.activePlayers.length
}

export function distributeCards(state, attackerId) {
    let newState = Object.assign({}, state)
    for (let i = 0; i < state.activePlayers.length; i++) {
        let playerId = (i + attackerId) % state.activePlayers.length
        let numCardsNeeded = Math.max(0, 6 - state.activePlayers[playerId].hand.length)
        for (let j = 0; j < numCardsNeeded; j++) {
            if (newState.deck.length > 0) {
                let card = newState.deck.pop()
                newState.activePlayers[playerId].hand.push(card)
            }
        }
    }
    return newState
}

export function verifyAttackDefended(state) {
    let attackingCards = state.table.filter(c => c.type === 'attack').map(c => c.card)
    let defensiveCards = state.table.filter(c => c.type === 'defense').map(c => c.card)

    if (attackingCards.length > defensiveCards.length) { return false }

    let defendedPairs = []
    attackingCards.forEach(ac => {
        let defenseCandidates = defensiveCards.filter(dc => beats(ac, dc, state.trumpSuit))
        let leastDefensiveCard = leastPowerfulCard(defenseCandidates, state.trumpSuit)

        // pair of attacking card and least possible defensive card to defended pairs
        if (leastDefensiveCard) {
            defendedPairs.push([ac, leastDefensiveCard])
            defensiveCards = defensiveCards.filter(c => c !== leastDefensiveCard)
        }
    })

    // Attack is defended when every attacking card has a unique defensive card
    return defendedPairs.length === attackingCards.length
}

export function leastPowerfulCard(cards, trumpSuit) {
    function compareByRank(a, b) {
        return a.rank - b.rank
    }

    let nonTrumpCards = cards.filter(c => c.suit !== trumpSuit)

    if (nonTrumpCards.length > 0) {
        return nonTrumpCards.sort(compareByRank)[0]
    } else {
        return cards.sort(compareByRank)[0]
    }
}

