
/**
 * State store dispatcher
 * API: getState(), dispatch(action), subscribe(listener)
 */
export default function createStore(reducer) {
	let state = reducer()
	let listeners = []
	return {
		getState: function() {
			return Object.assign({}, state)
		},
		dispatch: function(action) {
			state = reducer(Object.assign({}, state), action)
			listeners.forEach(function (listener) {
				listener()
			})
		},
		subscribe: function(listener) {
			listeners.push(listener)
			return function() {
				listeners = Object.assign({}, listeners.filter(function(l) {
					return l !== listener
				}))
			}
		}
	}
}
