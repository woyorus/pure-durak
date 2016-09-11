import { ADD_PLAYER, START_ROUND, MAKE_ATTACK, MAKE_DEFENSE } from './actions'
import { generateDeck, shuffleDeck } from './deck'
import { stringifyCard, beats } from './card'

const initialState = {
    roundInProgress: false,
	deck: [],
    trumpSuit: null,
    activePlayers: [],
    turnPointer: 0,
    table: []
}

/** Reducer: (state, action) -> state */
export default function gameApp(state = initialState, action = {}) {
    switch (action.type) {

        case ADD_PLAYER:
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

        case START_ROUND:
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

        case MAKE_ATTACK:
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
                if (!state.table.find(tableCard => tableCard.rank === attackCard.rank)) {
                    console.warn(`cannot attack with card ${stringifyCard(attackCard)}`)
                    return state
                }
            }

            let newHand = attacker.hand.filter(c => c !== attackCard)
            let newTable = [attackCard, ...state.table]
            let newState = Object.assign({}, state, { table: newTable })
            newState.activePlayers[action.playerId].hand = newHand
            return newState

        case MAKE_DEFENSE:
            // The defender is whoever sitting next to current attacker
            let turnDefenderId = (state.turnPointer + 1) % state.activePlayers.length
            if (action.playerId !== turnDefenderId) {
                console.warn(`player ${action.playerId} is not allowed to defend in this turn`)
                return state
            }
            let defender = state.activePlayers[action.playerId]
            let defenseCard = defender.hand[action.cardId]

            // Determine if the card beats any card on the table
            let defendedCards = state.table.filter(tc => beats(tc, defenseCard, state.trumpSuit))
            if (defendedCards.length === 0) {
                console.warn(`card ${stringifyCard(defenseCard)} cannot beat any card on the table`)
                return state
            }

            console.log(`${stringifyCard(defenseCard)} has beaten ${defendedCards.map(stringifyCard)}!`)

            let _newHand = defender.hand.filter(c => c !== defenseCard)
            let _newTable = [defenseCard, ...state.table]
            let _newState = Object.assign({}, state, { table: _newTable })
            _newState.activePlayers[action.playerId].hand = _newHand
            return _newState

        default:
            return state
    }
}
