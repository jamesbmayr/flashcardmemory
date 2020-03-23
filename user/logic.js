/*** modules ***/
	if (!MAIN) { var MAIN = require("../main/logic") }
	if (!HOME) { var HOME = require("../home/logic") }
	if (!DECK) { var DECK = require("../deck/logic") }
	module.exports = {}

/*** creates ***/
	/* createUser */
		module.exports.createUser = createUser
		function createUser(REQUEST, RESPONSE, DB, callback) {
			console.log(arguments.callee.name)
			try {
				// user
					var salt = MAIN.generateRandom()
					var user = {
						id: MAIN.generateRandom(),
						username: REQUEST.post.username,
						password: MAIN.hashRandom(REQUEST.post.password, salt),
						salt: salt
					}

				// query
					var query = {
						collection: "users",
						command: "insert",
						filters: null,
						document: user,
						options: {}
					}

				// insert
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success) {
							callback(results)
							return
						}

						// query
							var query = {
								collection: "sessions",
								command: "update",
								filters: {id: REQUEST.session.id},
								document: {userId: results.documents[0].id, updated: new Date().getTime()},
								options: {}
							}

						// update
							MAIN.accessDatabase(DB, query, function(results) {
								if (!results.success) {
									callback(results)
									return
								}

								// refresh
									callback({success: true, location: "/user/" + REQUEST.post.username})
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
	/* readUser */
		module.exports.readUser = readUser
		function readUser(REQUEST, RESPONSE, DB, callback) {
			console.log(arguments.callee.name)
			try {
				// query
					var query = {
						collection: "users",
						command: "find",
						filters: {username: REQUEST.post.username},
						document: null,
						options: {}
					}

				// find
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success) {
							callback(results)
							return
						}

						// user
							REQUEST.post.user = results.documents[0]
							DECK.readDecks(REQUEST, RESPONSE, DB, callback)
							return
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* readThisUser */
		module.exports.readThisUser = readThisUser
		function readThisUser(REQUEST, RESPONSE, DB, callback) {
			console.log(arguments.callee.name)
			try {
				// no user id
					if (!REQUEST.session.userId) {
						callback(REQUEST, RESPONSE)
						return
					}

				// query
					var query = {
						collection: "users",
						command: "find",
						filters: {id: REQUEST.session.userId},
						document: null,
						options: {}
					}

				// user
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success) {
							REQUEST.session.userId = null
							callback(REQUEST, RESPONSE)
							return
						}

						// user
							REQUEST.session.user = results.documents[0]

						// decks
							DECK.readThisUsersDecks(REQUEST, RESPONSE, DB, callback)
							return
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** updates ***/
	/* updateUsername */
		module.exports.updateUsername = updateUsername
		function updateUsername(REQUEST, RESPONSE, DB, callback) {
			console.log(arguments.callee.name)
			try {
				// authenticated?
					if (!REQUEST.session.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.username || !MAIN.isNumLet(REQUEST.post.username) || REQUEST.post.username.length < 8) {
						callback({success: false, message: "username must be 8+ numbers and letters"})
						return
					}

				// query
					var query = {
						collection: "users",
						command: "find",
						filters: {username: REQUEST.post.username},
						document: null,
						options: {}
					}

				// find
					MAIN.accessDatabase(DB, query, function(results) {
						if (results.success && results.count) {
							callback({success: false, message: "username in use"})
							return
						}

						// query
							var query = {
								collection: "users",
								command: "update",
								filters: {id: REQUEST.session.user.id},
								document: {username: REQUEST.post.username},
								options: {}
							}

						// update
							MAIN.accessDatabase(DB, query, function(results) {
								if (!results.success) {
									callback(results)
									return
								}

								// refresh
									callback({success: true, message: "username updated", location: "/user/" + results.documents[0].username})
									return
							})
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updatePassword */
		module.exports.updatePassword = updatePassword
		function updatePassword(REQUEST, RESPONSE, DB, callback) {
			console.log(arguments.callee.name)
			try {
				// authenticated?
					if (!REQUEST.session.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.new || REQUEST.post.new.length < 8) {
						callback({success: false, message: "password must be 8+ characters"})
						return
					}

				// authenticate old password
					if (MAIN.hashRandom(REQUEST.post.old, REQUEST.session.user.salt) !== REQUEST.session.user.password) {
						callback({success: false, message: "old password is incorrect"})
						return
					}

				// new salt
					var salt = MAIN.generateRandom()

				// query
					var query = {
						collection: "users",
						command: "update",
						filters: {id: REQUEST.session.user.id},
						document: {salt: salt, password: MAIN.hashRandom(REQUEST.post.new, salt)},
						options: {}
					}

				// update
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success) {
							callback(results)
							return
						}

						// respond
							REQUEST.session.user = results.documents[0]
							callback({success: true, message: "password updated"})
							return
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** deletes ***/
	/* deleteUser */
		module.exports.deleteUser = deleteUser
		function deleteUser(REQUEST, RESPONSE, DB, callback) {
			console.log(arguments.callee.name)
			try {
				// authenticated?
					if (!REQUEST.session.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// authenticate password
					if (MAIN.hashRandom(REQUEST.post.password, REQUEST.session.user.salt) !== REQUEST.session.user.password) {
						callback({success: false, message: "password is incorrect"})
						return
					}

				// query
					var query = {
						collection: "users",
						command: "delete",
						filters: {id: REQUEST.session.user.id},
						document: null,
						options: {}
					}

				// delete
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success) {
							callback(results)
							return
						}

						// query
							var query = {
								collection: "sessions",
								command: "update",
								filters: {id: REQUEST.session.id},
								document: {userId: null, updated: new Date().getTime()},
								options: {}
							}

						// update
							MAIN.accessDatabase(DB, query, function(results) {
								if (!results.success) {
									callback(results)
									return
								}

								// refresh
									callback({success: true, location: "/"})
									return
							})
					})

			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
