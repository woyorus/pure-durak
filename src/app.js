import gameApp from './game'
import createStore from './store'
import { stringifyCard, suits } from './card'

import { ADD_PLAYER, START_ROUND, MAKE_ATTACK, MAKE_DEFENSE, DEFENSE_TAKE, DEFENSE_DONE } from './actions'

/** Game state */
let game = createStore(gameApp)

let unsubscribe = game.subscribe(function () {
    printGameState(game.getState())
});

function printGameState(state) {
    console.log('\n', '> Game State Updated <');
    console.log(`[${state.activePlayers.length} active player(s)]`);
    console.log(`Current turn: ${state.activePlayers[state.turnPointer].name}`);
    console.log(`Deck has ${state.deck.length} cards left [trump: ${suits[state.trumpSuit]}]`);
    console.log('Table:', state.table.map(tc => `[${tc.type}] ${stringifyCard(tc.card)}`));
    console.log(`Done heap has ${state.doneCards.length} cards`);
    state.activePlayers.forEach(p => console.log(p.name, '\'s hand:', p.hand.map(stringifyCard)))
}

/// Simple game simulation

game.dispatch({
    type: ADD_PLAYER,
    name: 'Alice'
})

game.dispatch({
    type: ADD_PLAYER,
    name: 'Eve'
})

game.dispatch({
    type: START_ROUND
})

game.dispatch({
    type: MAKE_ATTACK,
    playerId: 0,
    cardId: 0
})

game.dispatch({
    type: MAKE_DEFENSE,
    playerId: 1,
    cardId: 0
})

game.dispatch({
    type: DEFENSE_DONE,
    playerId: 1
})

///
