
import gameApp from './game'
import createStore from './store'
import { ADD_PLAYER, START_ROUND } from './actions'

/** Game state */
let game = createStore(gameApp)

let unsubscribe = game.subscribe(function () {
    console.log('\n', '> Game State Updated <');
    console.dir(game.getState())
});

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

