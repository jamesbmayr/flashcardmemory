/*** modules ***/
	if (!MAIN) { var MAIN = require("../main/logic") }
	if (!HOME) { var HOME = require("../home/logic") }
	if (!USER) { var USER = require("../user/logic") }
	module.exports = {}

/*** creates ***/
	/* createDeck */
		module.exports.createDeck = createDeck
		function createDeck(REQUEST, RESPONSE, DB, callback) {
			try {
				// validate
					if (!REQUEST.session.user) {
						callback({success: false, message: "sign in to create a deck"})
						return
					}
					else if (!REQUEST.post.name || !MAIN.isNumLet(REQUEST.post.name) || REQUEST.post.name.length < 8) {
						callback({success: false, message: "deck name must be 8+ numbers and letters"})
						return
					}

				// query
					var query = {
						collection: "decks",
						command: "find",
						filters: {name: REQUEST.post.name},
						document: null,
						options: {}
					}

				// find
					MAIN.accessDatabase(DB, query, function(results) {
						if (results.success && results.count) {
							callback({success: false, message: "deck name already in use"})
							return
						}

						// deck
							var deck = {
								id: MAIN.generateRandom(),
								creator: REQUEST.session.user.id,
								name: REQUEST.post.name,
								pairs: []
							}

						// query
							var query = {
								collection: "decks",
								command: "insert",
								filters: null,
								document: deck,
								options: {}
							}

						// insert
							MAIN.accessDatabase(DB, query, function(results) {
								if (!results.success) {
									callback(results)
									return
								}

								// refresh
									callback({success: true, location: "/deck/" + results.documents[0].name})
									return
							})
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** reads ***/
	/* readDeck */
		module.exports.readDeck = readDeck
		function readDeck(REQUEST, RESPONSE, DB, callback) {
			try {
				// query
					var query = {
						collection: "decks",
						command: "find",
						filters: {name: REQUEST.post.name},
						document: null,
						options: {}
					}

				// find
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success) {
							callback(results)
							return
						}

						// deck
							REQUEST.post.deck = results.documents[0]

						// query
							var query = {
								collection: "users",
								command: "find",
								filters: {id: REQUEST.post.deck.creator},
								document: null,
								options: {}
							}

							// find
								MAIN.accessDatabase(DB, query, function(results) {
									if (!results.success) {
										REQUEST.post.deck.creatorName = "?"
										callback({success: true, deck: REQUEST.post.deck})
										return
									}

									// creator name
										REQUEST.post.deck.creatorName = results.documents[0].username
										callback({success: true, deck: REQUEST.post.deck})
										return
								})
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* readDecks */
		module.exports.readDecks = readDecks
		function readDecks(REQUEST, RESPONSE, DB, callback) {
			try {
				// query
					var query = {
						collection: "decks",
						command: "find",
						filters: {creator: REQUEST.post.user.id},
						document: null,
						options: {}
					}

				// find
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success) {
							callback({success: true, user: REQUEST.post.user})
							return
						}

						// decks
							REQUEST.post.user.decks = results.documents
							callback({success: true, user: REQUEST.post.user})
							return
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* readThisUsersDecks */
		module.exports.readThisUsersDecks = readThisUsersDecks
		function readThisUsersDecks(REQUEST, RESPONSE, DB, callback) {
			try {
				// query
					var query = {
						collection: "decks",
						command: "find",
						filters: {creator: REQUEST.session.user.id},
						document: null,
						options: {}
					}

				// find
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success) {
							callback(REQUEST, RESPONSE)
							return
						}

						// decks
							REQUEST.session.user.decks = results.documents
							callback(REQUEST, RESPONSE)
							return
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* searchDecks */
		module.exports.searchDecks = searchDecks
		function searchDecks(REQUEST, RESPONSE, DB, callback) {
			try {
				// get search string
					if (!REQUEST.get || !REQUEST.get.q) {
						callback({success: false, message: "no search query"})
						return
					}

				// query
					var query = {
						collection: "decks",
						command: "find",
						filters: {name: eval("/.*" + REQUEST.get.q + ".*/i")},
						document: null,
						options: {}
					}

				// find
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success) {
							REQUEST.searchResults = []
							callback(results)
							return
						}

						REQUEST.searchResults = results.documents
						callback(results)
						return
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** updates ***/
	/* updateDeck */
		module.exports.updateDeck = updateDeck
		function updateDeck(REQUEST, RESPONSE, DB, callback) {
			try {
				// validate
					if (!REQUEST.session.user) {
						callback({success: false, message: "sign in to update a deck"})
						return
					}
					else if (REQUEST.post.deck.name && (!MAIN.isNumLet(REQUEST.post.deck.name) || REQUEST.post.deck.name.length < 8)) {
						callback({success: false, message: "deck name must be 8+ numbers and letters"})
						return
					}

				// query
					var query = {
						collection: "decks",
						command: "find",
						filters: {name: REQUEST.post.deck.name},
						document: null,
						options: {}
					}

				// find
					MAIN.accessDatabase(DB, query, function(results) {
						if (results.success && results.documents[0].id !== REQUEST.post.deck.id) {
							callback({success: false, message: "deck name already in use"})
							return
						}

						// same name
							if (results.success && results.documents[0].id == REQUEST.post.deck.id) {
								var sameName = true
							}

						// query
							var query = {
								collection: "decks",
								command: "update",
								filters: {creator: REQUEST.session.user.id, id: REQUEST.post.deck.id},
								document: {
									name: REQUEST.post.deck.name,
									pairs: REQUEST.post.deck.pairs
								},
								options: {}
							}

						// update
							MAIN.accessDatabase(DB, query, function(results) {
								if (!results.success) {
									callback(results)
									return
								}

								// respond / refresh
									var location = sameName ? null : results.documents[0].name
									callback({success: true, message: "deck updated", deck: results.documents[0], location: location})
									return
							})
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** deletes ***/
	/* deleteDeck */
		module.exports.deleteDeck = deleteDeck
		function deleteDeck(REQUEST, RESPONSE, DB, callback) {
			try {
				// validate
					if (!REQUEST.session.user) {
						callback({success: false, message: "sign in to delete a deck"})
						return
					}

				// query
					var query = {
						collection: "decks",
						command: "delete",
						filters: {creator: REQUEST.session.user.id, id: REQUEST.post.deck.id},
						document: null,
						options: {}
					}

				// delete
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success) {
							callback(results)
							return
						}

						callback({success: true, location: "/"})
						return
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
