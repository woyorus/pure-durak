import 'babel-polyfill'

const expect = require('chai').expect;

import createStore from '../src/store'
import gameApp, {distributeCards, verifyAttackDefended, leastPowerfulCard} from '../src/game'
import {ADD_PLAYER, START_ROUND} from '../src/actions'
import {beats, makeCard, suits, ranks} from '../src/card'
import {generateDeck, shuffleDeck} from '../src/deck'

describe('Durak App', function () {

    let trumpSuit = 1
    let nonTrumpSuit = 0

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

    describe('verifyAttackDefended', function () {
        it('should verify that attacking cards are beaten', function () {
            let table = [
                {card: makeCard(nonTrumpSuit, 4), type: 'attack'},
                {card: makeCard(nonTrumpSuit, 5), type: 'defense'}
            ]
            let stubState = {
                table,
                trumpSuit
            }
            expect(verifyAttackDefended(stubState)).to.be.true
        })

        it('should verify that attacking cards are beaten', function () {
            let table = [
                {card: makeCard(0, 4), type: 'attack'},
                {card: makeCard(1, 1), type: 'attack'},
                {card: makeCard(0, 5), type: 'defense'},
                {card: makeCard(1, 3), type: 'defense'}
            ]
            let stubState = {
                table,
                trumpSuit: 2
            }
            expect(verifyAttackDefended(stubState)).to.be.true
        })

        it('should verify that attacking cards are beaten one trump', function () {
            let table = [
                {card: makeCard(0, 4), type: 'attack'},
                {card: makeCard(1, 1), type: 'attack'},
                {card: makeCard(0, 5), type: 'defense'},
                {card: makeCard(2, 3), type: 'defense'}
            ]
            let stubState = {
                table,
                trumpSuit: 2
            }
            expect(verifyAttackDefended(stubState)).to.be.true
        })

        it('should verify that cards are not beaten', function () {
            let table = [{card: makeCard(nonTrumpSuit, 5), type: 'attack'}]
            let state = {table, trumpSuit}
            expect(verifyAttackDefended(state)).to.be.false
        })

        it('should verify that cards are not beaten', function () {
            let table = [
                {card: makeCard(0, 5), type: 'attack'},
                {card: makeCard(1, 6), type: 'defense'}
            ]
            let state = {table, trumpSuit: 2}
            expect(verifyAttackDefended(state)).to.be.false
        })
    })

    describe('leastPowerfulCard', function () {

        it('should return the card itself among single card input', function () {
            let cards = [ makeCard(nonTrumpSuit, 1) ]
            expect(leastPowerfulCard(cards, trumpSuit)).to.be.equal(cards[0])
        })

        it('should determine lowest rank card among same suit', function () {
            let cards = [
                makeCard(nonTrumpSuit, 1),
                makeCard(nonTrumpSuit, 3),
                makeCard(nonTrumpSuit, 5)
            ]
            expect(leastPowerfulCard(cards, trumpSuit)).to.be.equal(cards[0])
        })

        it('should correctly determine that trump card is lower than non-trump', function () {
            let trump6 = makeCard(trumpSuit, 0)
            let nonTrumpKing = makeCard(nonTrumpSuit, 7)
            expect(leastPowerfulCard([trump6, nonTrumpKing], trumpSuit)).to.be.equal(nonTrumpKing)
        })

        it('should select lowest rank trump card', function () {
            let trump6 = makeCard(trumpSuit, 0)
            let trumpKing = makeCard(trumpSuit, 7)
            expect(leastPowerfulCard([trump6, trumpKing], trumpSuit)).to.be.equal(trump6)
        })

        it('should always favor non-trump cards over trump cards', function () {
            let nonTrump = makeCard(0, 5)
            let trump = makeCard(2, 3)
            expect(leastPowerfulCard([nonTrump, trump], 2)).to.be.equal(nonTrump)
        })
    })

})
