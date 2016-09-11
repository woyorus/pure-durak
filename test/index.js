import 'babel-polyfill'

const expect = require('chai').expect;

import createStore from '../src/store'
import gameApp from '../src/game'
import { ADD_PLAYER, START_ROUND } from '../src/actions'

describe('Durak App', function () {

    describe('createStore', function () {
        it('should create store', function () {
            let game = createStore(gameApp)
            expect(game).to.be.an('object')
            expect(game.getState).to.be.a('function')
            expect(game.dispatch).to.be.a('function')
            expect(game.subscribe).to.be.a('function')
        })
    })

    describe('game', function () {
        let game;

        beforeEach(function () {
            game = createStore(gameApp)
        })

        it('should be not in progress', function () {
            expect(game.getState().roundInProgress).to.be.false
        })

        it('should have zero active players', function () {
            expect(game.getState().activePlayers.length).to.be.equal(0)
        })

        it('should add players', function () {
            game.dispatch({
                type: ADD_PLAYER,
                name: 'Stepa'
            })
            expect(game.getState().activePlayers.length).to.be.equal(1)
            expect(game.getState().activePlayers[0].name).to.be.equal('Stepa')
            expect(game.getState().activePlayers[0].hand.length).to.be.equal(0)
        })

        it('shoud not start round without players', function () {
            game.dispatch({
                type: START_ROUND
            })
            expect(game.getState().roundInProgress).to.be.false
        })

        it('shoud not start round with a single player', function () {
            game.dispatch({
                type: ADD_PLAYER,
                name: 'Stepa'
            })
            game.dispatch({
                type: START_ROUND
            })
            expect(game.getState().roundInProgress).to.be.false
        })

    })

    describe('active round', function () {
        let game;
        beforeEach(function () {
            game = createStore(gameApp)
            game.dispatch({
                type: ADD_PLAYER,
                name: 'Stepa'
            })
            game.dispatch({
                type: ADD_PLAYER,
                name: 'Vova'
            })
            game.dispatch({
                type: START_ROUND
            })
        })

        it('should distribute cards to players', function () {
            expect(game.getState().roundInProgress).to.be.true
            expect(game.getState().deck.length).to.be.equal(24)
            expect(game.getState().activePlayers[0].hand.length).to.be.equal(6)
            expect(game.getState().activePlayers[1].hand.length).to.be.equal(6)
        })

        it('should set a trump suit', function () {
            expect(game.getState().trumpSuit).to.be.a('number')
        })

        it('should put the trump card to bottom of deck', function () {
            let trumpSuit = game.getState().trumpSuit
            expect(game.getState().deck[0].suit).to.be.equal(trumpSuit)
        })
    })

    describe('many players case', function () {
        let game;

        beforeEach(function () {
            game = createStore(gameApp)
            game.dispatch({
                type: ADD_PLAYER,
                name: 'Stepa'
            })
            game.dispatch({
                type: ADD_PLAYER,
                name: 'Vova'
            })
            game.dispatch({
                type: ADD_PLAYER,
                name: 'Petya'
            })
            game.dispatch({
                type: ADD_PLAYER,
                name: 'Vanya'
            })
            game.dispatch({
                type: ADD_PLAYER,
                name: 'Maga'
            })
            game.dispatch({
                type: ADD_PLAYER,
                name: 'Magamet'
            })
        })

        it('should not register more than 6 players', function () {
            game.dispatch({
                type: ADD_PLAYER,
                name: 'MagaMETH'
            })
            expect(game.getState().activePlayers.length).to.be.equal(6)
        })

        it('should have 0 card in deck', function () {
            game.dispatch({
                type: START_ROUND
            })
            expect(game.getState().deck.length).to.be.equal(0)
        })

    })

})
