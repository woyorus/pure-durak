import { ADD_PLAYER, START_ROUND } from './actions'
import { generateDeck, shuffleDeck } from './deck'

const initialState = {
    roundInProgress: false,
	deck: null,
    trumpSuit: null,
    activePlayers: [],
    turnPointer: 0
}

/** Reducer: (state, action) -> state */
export default function gameApp(state = initialState, action = {}) {
    switch (action.type) {

        case ADD_PLAYER:
            if (state.activePlayers.length === 6) {
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
                return state
            }

            let freshDeck = shuffleDeck(generateDeck())
            let trumpSuit;

            // Distribute cards among players
            for (let i = 0; i < 6; i++) {
                state.activePlayers.forEach(player => {
                    let card = freshDeck.pop()
                    if (freshDeck.length === 0) {
                        trumpSuit = card.suit
                    }
                    player.hand.push(card)
                })
            }

            if (freshDeck.length !== 0) {
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

        default:
            return state
    }
}
