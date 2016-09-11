import 'babel-polyfill'

const expect = require('chai').expect;

import createStore from '../src/store'
import gameApp, { distributeCards } from '../src/game'
import { ADD_PLAYER, START_ROUND } from '../src/actions'
import { beats, makeCard, suits, ranks } from '../src/card'
import { generateDeck, shuffleDeck } from '../src/deck'


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

    describe('max players case', function () {
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

    describe('card', function () {
        describe('beats', function () {
            it('should beat lower ranked card of same suit', function () {
                let def = makeCard(0, 5)
                let atk = makeCard(0, 6)
                expect(beats(def, atk, 2)).to.be.true
            })

            it('should not beat higher ranked card of same suit', function () {
                let def = makeCard(0, 5)
                let atk = makeCard(0, 4)
                expect(beats(def, atk, 2)).to.be.false
            })

            it('should not beat lower ranked card of different suit', function () {
                let def = makeCard(0, 5)
                let atk = makeCard(1, 6)
                expect(beats(def, atk, 2)).to.be.false
            })

            it('should not beat higher ranked card of different suit', function () {
                let def = makeCard(0, 6)
                let atk = makeCard(1, 5)
                expect(beats(def, atk, 2)).to.be.false
            })

            it('should beat higher card of different suit if attacker is trump', function () {
                let def = makeCard(0, 6)
                let atk = makeCard(1, 5)
                expect(beats(def, atk, 1)).to.be.true
            })

            it('should not beat higher ranked card if both are trumps', function () {
                let def = makeCard(1, 6)
                let atk = makeCard(1, 5)
                expect(beats(def, atk, 1)).to.be.false
            })
        })
    })

    describe('distributeCards', function () {
        let initialState = {
            roundInProgress: true,
            deck: shuffleDeck(generateDeck()),
            trumpSuit: 0,
            activePlayers: [
                {
                    name: 'vasya',
                    hand: [
                        makeCard(1, 3),
                        makeCard(0, 5),
                        makeCard(2, 7)
                    ]
                },
                {
                    name: 'petya',
                    hand: [
                        makeCard(1, 4),
                        makeCard(0, 6),
                        makeCard(2, 2),
                        makeCard(1, 5),
                        makeCard(1, 6),
                        makeCard(3, 6)
                    ]
                }
            ],
            turnPointer: 0,
            table: []
        }

        it('should distribute cards', function () {
            let state = JSON.parse(JSON.stringify(initialState))
            let topThreeCards = state.deck.slice(-3)
            state = distributeCards(state, 0)
            expect(state.deck.length).to.be.equal(33)
            expect(state.activePlayers[0].hand.length).to.be.equal(6)
            expect(state.activePlayers[1].hand.length).to.be.equal(6)
            expect(state.activePlayers[0].hand.includes(topThreeCards[0])).to.be.true
            expect(state.activePlayers[0].hand.includes(topThreeCards[1])).to.be.true
            expect(state.activePlayers[0].hand.includes(topThreeCards[2])).to.be.true
        })

        it('should not distribute any cards if deck is empty', function () {
            let state = JSON.parse(JSON.stringify(initialState))
            state.deck = []
            state = distributeCards(state, 0)
            expect(state.deck.length).to.be.equal(0)
            expect(state.activePlayers[0].hand.length).to.be.equal(3)
            expect(state.activePlayers[1].hand.length).to.be.equal(6)
        })

    })
})
