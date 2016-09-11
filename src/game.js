import { ADD_PLAYER, START_ROUND, MAKE_ATTACK } from './actions'
import { generateDeck, shuffleDeck } from './deck'
import { stringifyCard } from './card'

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

            let attackingPlayer = state.activePlayers[action.playerId]
            let attackCard = attackingPlayer.hand[action.cardId]

            // Ensure that there's a same rank card already on the table if there are cards on table at all
            // (the very first card in attack round can be any suit/rank)
            if (state.table.length > 0) {
                if (!state.table.find(tableCard => tableCard.rank === attackCard.rank)) {
                    console.warn(`cannot attack with card ${stringifyCard(attackCard)}`)
                    return state
                }
            }

            let newHand = attackingPlayer.hand.filter(c => c !== attackCard)
            let newTable = [attackCard, ...state.table]
            let newState = Object.assign({}, state, { table: newTable })
            newState.activePlayers[action.playerId].hand = newHand
            return newState

        default:
            return state
    }
}
