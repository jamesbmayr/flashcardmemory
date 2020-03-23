/*** modules ***/
	if (!MAIN) { var MAIN = require("../main/logic") }
	if (!USER) { var USER = require("../user/logic") }
	if (!DECK) { var DECK = require("../deck/logic") }
	module.exports = {}

/*** authentication ***/
	/* signUp */
		module.exports.signUp = signUp
		function signUp(REQUEST, RESPONSE, DB, callback) {
			try {
				// validate
					if (!REQUEST.post.username || !MAIN.isNumLet(REQUEST.post.username) || REQUEST.post.username.length < 8) {
						callback({success: false, message: "username must be 8+ numbers and letters"})
						return
					}
					if (!REQUEST.post.password || REQUEST.post.password.length < 8) {
						callback({success: false, message: "password must be 8+ characters"})
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

						// create
							USER.createUser(REQUEST, RESPONSE, DB, callback)
							return
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* signIn */
		module.exports.signIn = signIn
		function signIn(REQUEST, RESPONSE, DB, callback) {
			try {
				// validate
					if (!REQUEST.post.username || !MAIN.isNumLet(REQUEST.post.username) || REQUEST.post.username.length < 8) {
						callback({success: false, message: "username must be 8+ numbers and letters"})
						return
					}
					if (!REQUEST.post.password || REQUEST.post.password.length < 8) {
						callback({success: false, message: "password must be 8+ characters"})
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
						if (!results.success) {
							callback({success: false, message: "invalid username or password"})
							return
						}

						// compare passwords
							var salt = results.documents[0].salt
							if (MAIN.hashRandom(REQUEST.post.password, salt) !== results.documents[0].password) {
								callback({success: false, message: "invalid username or password"})
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

	/* signOut */
		module.exports.signOut = signOut
		function signOut(REQUEST, RESPONSE, DB, callback) {
			try {
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
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
