/*** modules ***/
	var MAIN = require("../main/logic")
	module.exports = {}

/*** authentication ***/
	/* signUp */
		module.exports.signUp = signUp
		function signUp(REQUEST, DB, callback) {
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

						// create user
							var salt = MAIN.generateRandom()
							var user = {
								id: MAIN.generateRandom(),
								username: REQUEST.post.username,
								password: MAIN.hashRandom(REQUEST.post.password, salt),
								salt: salt,
								decks: []
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
								if (!results.success || !results.documents) {
									callback(results)
									return
								}

								// query
									var query = {
										collection: "sessions",
										command: "update",
										filters: {id: REQUEST.session.id},
										document: {userId: results.documents[0].id},
										options: {}
									}

								// update
									MAIN.accessDatabase(DB, query, function(results) {
										if (!results.success || !results.documents) {
											callback(results)
											return
										}

										// refresh
											callback({success: true, location: "/"})
									})
							})
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* signIn */
		module.exports.signIn = signIn
		function signIn(REQUEST, DB, callback) {
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
						if (!results.success && !results.documents) {
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
								document: {userId: results.documents[0].id},
								options: {}
							}

						// update
							MAIN.accessDatabase(DB, query, function(results) {
								if (!results.success || !results.documents) {
									callback(results)
									return
								}

								// refresh
									callback({success: true, location: "/"})
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
		function signOut(REQUEST, DB, callback) {
			try {
				// query
					var query = {
						collection: "sessions",
						command: "update",
						filters: {id: REQUEST.session.id},
						document: {userId: null},
						options: {}
					}

				// update
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success || !results.documents) {
							callback(results)
							return
						}

						// refresh
							callback({success: true, location: "/"})
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** changes ***/
	/* changeUsername */
		module.exports.changeUsername = changeUsername
		function changeUsername(REQUEST, DB, callback) {
			try {
				// authenticated?
					if (!REQUEST.session.userId) {
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
								filters: {id: REQUEST.session.userId},
								document: {username: REQUEST.post.username},
								options: {}
							}

						// update
							MAIN.accessDatabase(DB, query, function(results) {
								if (!results.success || !results.documents) {
									callback(results)
									return
								}

								// refresh
									REQUEST.session.user = results.documents[0]
									callback({success: true, message: "username updated"})
									return
							})
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* changePassword */
		module.exports.changePassword = changePassword
		function changePassword(REQUEST, DB, callback) {
			try {
				// authenticated?
					if (!REQUEST.session.userId) {
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
						filters: {id: REQUEST.session.userId},
						document: {salt: salt, password: MAIN.hashRandom(REQUEST.post.new, salt)},
						options: {}
					}

				// update
					MAIN.accessDatabase(DB, query, function(results) {
						if (!results.success || !results.documents) {
							callback(results)
							return
						}

						// refresh
							REQUEST.session.user = results.documents[0]
							callback({success: true, message: "password updated"})
					})
			}
			catch (error) {
				MAIN.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
