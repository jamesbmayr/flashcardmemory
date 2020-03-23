/*** modules ***/
	if (!HTTP)   { var HTTP   = require("http") }
	if (!FS)     { var FS     = require("fs") }
	if (!CRYPTO) { var CRYPTO = require("crypto") }
	module.exports = {}

/*** constants ***/
	var ENVIRONMENT = getEnvironment()
	if (ENVIRONMENT.db_url) {
		var MONGO = require("mongodb").MongoClient
	}

/*** logs ***/
	/* logError */
		module.exports.logError = logError
		function logError(error) {
			if (ENVIRONMENT.debug) {
				console.log("\n*** ERROR @ " + new Date().toLocaleString() + " ***")
				console.log(" - " + error)
				console.dir(arguments)
			}
		}

	/* logStatus */
		module.exports.logStatus = logStatus
		function logStatus(status) {
			if (ENVIRONMENT.debug) {
				console.log("\n--- STATUS @ " + new Date().toLocaleString() + " ---")
				console.log(" - " + status)

			}
		}

	/* logMessage */
		module.exports.logMessage = logMessage
		function logMessage(message) {
			if (ENVIRONMENT.debug) {
				console.log(" - " + new Date().toLocaleString() + ": " + message)
			}
		}

	/* logTime */
		module.exports.logTime = logTime
		function logTime(flag, callback) {
			if (ENVIRONMENT.debug) {
				var before = process.hrtime()
				callback()
				
				var after = process.hrtime(before)[1] / 1e6
				if (after > 5) {
					logMessage(flag + " " + after)
				}
			}
			else {
				callback()
			}
		}

/*** maps ***/
	/* getEnvironment */
		module.exports.getEnvironment = getEnvironment
		function getEnvironment() {
			console.log(arguments.callee.name)
			try {
				if (process.env.DOMAIN !== undefined) {
					return {
						port:        process.env.PORT,
						domain:      process.env.DOMAIN,
						debug:      (process.env.DEBUG || false),
						db_username: process.env.DB_USERNAME,
						db_password: process.env.DB_PASSWORD,
						db_url:      process.env.DB_URL,
						db_name:     process.env.DB_NAME
					}
				}
				else {
					return {
						port:        3000,
						domain:      "localhost",
						debug:       true,
						db_username: null,
						db_password: null,
						db_url:      null,
						db_name:     null
					}
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getAsset */
		module.exports.getAsset = getAsset
		function getAsset(index) {
			console.log(arguments.callee.name)
			try {
				switch (index) {
					case "logo":
						return "logo.png"
					break
					case "meta":
						return '<meta charset="UTF-8"/>\
								<meta name="description" content="flashcardmemory"/>\
								<meta name="author" content="James Mayr"/>\
								<meta property="og:title" content="flashcardmemory"/>\
								<meta property="og:url" content="https://flashcardmemory.herokuapp.com"/>\
								<meta property="og:description" content="flashcardmemory"/>\
								<meta property="og:image" content="https://flashcardmemory.herokuapp.com/logo.png"/>\
								<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>'
					break
					case "fonts":
							return '<link href="https://fonts.googleapis.com/css?family=Sen" rel="stylesheet">'
						break

					case "constants":
						return {
							cookieLength: 1000 * 60 * 60 * 24 * 7
						}
					break

					default:
						return null
					break
				}
			}
			catch (error) {logError(error)}
		}

	/* getContentType */
		module.exports.getContentType = getContentType
		function getContentType(string) {
			console.log(arguments.callee.name)
			try {
				var array = string.split(".")
				var extension = array[array.length - 1].toLowerCase()

				switch (extension) {
					// application
						case "json":
						case "pdf":
						case "rtf":
						case "xml":
						case "zip":
							return "application/" + extension
						break

					// font
						case "otf":
						case "ttf":
						case "woff":
						case "woff2":
							return "font/" + extension
						break

					// audio
						case "aac":
						case "midi":
						case "wav":
							return "audio/" + extension
						break
						case "mid":
							return "audio/midi"
						break
						case "mp3":
							return "audio/mpeg"
						break
						case "oga":
							return "audio/ogg"
						break
						case "weba":
							return "audio/webm"
						break

					// images
						case "iso":
						case "bmp":
						case "gif":
						case "jpeg":
						case "png":
						case "tiff":
						case "webp":
							return "image/" + extension
						break
						case "jpg":
							return "image/jpeg"
						break
						case "svg":
							return "image/svg+xml"
						break
						case "tif":
							return "image/tiff"
						break

					// video
						case "mpeg":
						case "webm":
							return "video/" + extension
						break
						case "ogv":
							return "video/ogg"
						break

					// text
						case "css":
						case "csv":
						case "html":
						case "js":
							return "text/" + extension
						break

						case "md":
							return "text/html"
						break

						case "txt":
						default:
							return "text/plain"
						break
				}
			}
			catch (error) {logError(error)}
		}

/*** checks ***/
	/* isNumLet */
		module.exports.isNumLet = isNumLet
		function isNumLet(string) {
			console.log(arguments.callee.name)
			try {
				return (/^[a-zA-Z0-9]+$/).test(string)
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** tools ***/
	/* renderHTML */
		module.exports.renderHTML = renderHTML
		function renderHTML(REQUEST, path, callback) {
			console.log(arguments.callee.name)
			try {
				var html = {}
				FS.readFile(path, "utf8", function (error, file) {
					if (error) {
						logError(error)
						callback("")
						return
					}
					
					html.original = file
					html.array = html.original.split(/<script\snode>|<\/script>node>/gi)

					for (html.count = 1; html.count < html.array.length; html.count += 2) {
						try {
							html.temp = eval(html.array[html.count])
						}
						catch (error) {
							html.temp = ""
							logError("<sn>" + Math.ceil(html.count / 2) + "</sn>\n" + error)
						}
						html.array[html.count] = html.temp
					}

					callback(html.array.join(""))
				})
			}
			catch (error) {
				logError(error)
				callback("")
			}
		}

	/* duplicateObject */
		module.exports.duplicateObject = duplicateObject
		function duplicateObject(object) {
			console.log(arguments.callee.name)
			try {
				return JSON.parse(JSON.stringify(object))
			}
			catch (error) {
				logError(error)
				return null
			}
		}

/*** randoms ***/
	/* hashRandom */
		module.exports.hashRandom = hashRandom
		function hashRandom(string, salt) {
			console.log(arguments.callee.name)
			try {
				return CRYPTO.createHmac("sha512", salt).update(string).digest("hex")
			}
			catch (error) {
				logError(error)
				return null
			}
		}

	/* generateRandom */
		module.exports.generateRandom = generateRandom
		function generateRandom(set, length) {
			console.log(arguments.callee.name)
			try {
				set = set || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
				length = length || 32
				
				var output = ""
				for (var i = 0; i < length; i++) {
					output += (set[Math.floor(Math.random() * set.length)])
				}

				return output
			}
			catch (error) {
				logError(error)
				return null
			}
		}

	/* chooseRandom */
		module.exports.chooseRandom = chooseRandom
		function chooseRandom(options) {
			console.log(arguments.callee.name)
			try {
				if (!Array.isArray(options)) {
					return false
				}
				else {
					return options[Math.floor(Math.random() * options.length)]
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** sessions ***/
	/* createSession */
		module.exports.createSession = createSession
		function createSession(REQUEST, RESPONSE, DB, callback) {
			console.log(arguments.callee.name)
			try {
				// session
					var session = {
						id: generateRandom(),
						updated: new Date().getTime(),
						userId: null,
						info: {
							"ip":         REQUEST.ip,
				 			"user-agent": REQUEST.headers["user-agent"],
				 			"language":   REQUEST.headers["accept-language"],
						},
					}

				// query
					var query = {
						collection: "sessions",
						command: "insert",
						filters: null,
						document: session,
						options: {}
					}

				// insert
					accessDatabase(DB, query, function(results) {
						if (!results.success) {
							logError(results.message)
							return
						}

						REQUEST.session = session
						REQUEST.cookie.session = session.id
						callback(REQUEST, RESPONSE)
						return
					})
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* readSession */
		module.exports.readSession = readSession
		function readSession(REQUEST, RESPONSE, DB, callback) {
			console.log(arguments.callee.name)
			try {
				// no cookie
					if (!REQUEST.cookie.session || REQUEST.cookie.session == null || REQUEST.cookie.session == 0) {
						createSession(REQUEST, RESPONSE, DB, callback)
						return
					}

				// query
					var query = {
						collection: "sessions",
						command: "find",
						filters: {id: REQUEST.cookie.session},
						document: null,
						options: {}
					}

				// find
					accessDatabase(DB, query, function(results) {
						if (!results.success) {
							REQUEST.session = REQUEST.cookie.session = null
							readSession(REQUEST, RESPONSE, DB, callback)
							return
						}

						// update
							REQUEST.session = results.documents[0]
							updateSession(REQUEST, RESPONSE, DB, callback)
							return
					})
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateSession */
		module.exports.updateSession = updateSession
		function updateSession(REQUEST, RESPONSE, DB, callback) {
			console.log(arguments.callee.name)
			try {
				// query
					var query = {
						collection: "sessions",
						command: "update",
						filters: {id: REQUEST.session.id},
						document: {updated: new Date().getTime()},
						options: {}
					}

				// update
					accessDatabase(DB, query, function(results) {
						if (!results.success) {
							REQUEST.session = REQUEST.cookie.session = null
							readSession(REQUEST, RESPONSE, DB, callback)
							return
						}

						// results
							REQUEST.session = results.documents[0]
							REQUEST.cookie.session = results.documents[0].id

						// find user
							USER.readThisUser(REQUEST, RESPONSE, DB, callback)
							return
					})
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
	
/*** database ***/
	/* accessDatabase */
		module.exports.accessDatabase = accessDatabase
		function accessDatabase(DB, query, callback) {
			console.log(arguments.callee.name)
			try {
				// connect
					if (ENVIRONMENT.db_url) {
						accessMongo(DB, query, callback)
						return
					}

				// fake database?
					if (!DB) {
						logError("database not found")
						callback({success: false, message: "database not found"})
						return
					}

				// collection
					if (!DB[query.collection]) {
						logError("collection not found")
						callback({success: false, message: "collection not found"})
						return
					}

				// find
					if (query.command == "find") {
						// all documents
							var documentKeys = Object.keys(DB[query.collection])

						// apply filters
							var filters = Object.keys(query.filters)
							for (var f in filters) {
								documentKeys = documentKeys.filter(function(key) {
									return DB[query.collection][key][filters[f]] == query.filters[filters[f]]
								})
							}

						// get documents
							var documents = []
							for (var d in documentKeys) {
								documents.push(duplicateObject(DB[query.collection][documentKeys[d]]))
							}

						// no documents
							if (!documents.length) {
								callback({success: false, count: 0, documents: []})
								return
							}

						// yes documents
							callback({success: true, count: documentKeys.length, documents: documents})
							return
					}

				// insert
					if (query.command == "insert") {
						// unique id
							do {
								var id = generateRandom()
							}
							while (DB[query.collection][id])

						// insert document
							DB[query.collection][id] = duplicateObject(query.document)

						// return document
							callback({success: true, count: 1, documents: [query.document]})
							return
					}

				// update
					if (query.command == "update") {
						// all documents
							var documentKeys = Object.keys(DB[query.collection])

						// apply filters
							var filters = Object.keys(query.filters)
							for (var f in filters) {
								documentKeys = documentKeys.filter(function(key) {
									return DB[query.collection][key][filters[f]] == query.filters[filters[f]]
								})
							}

						// update keys
							var updateKeys = Object.keys(query.document)

						// update
							for (var d in documentKeys) {
								var document = DB[query.collection][documentKeys[d]]

								for (var u in updateKeys) {
									document[updateKeys[u]] = query.document[updateKeys[u]]
								}
							}

						// update documents
							var documents = []
							for (var d in documentKeys) {
								documents.push(duplicateObject(DB[query.collection][documentKeys[d]]))
							}

						// no documents
							if (!documents.length) {
								callback({success: false, count: 0, documents: []})
								return
							}

						// yes documents
							callback({success: true, count: documentKeys.length, documents: documents})
							return
					}

				// delete
					if (query.command == "delete") {
						// all documents
							var documentKeys = Object.keys(DB[query.collection])

						// apply filters
							var filters = Object.keys(query.filters)
							for (var f in filters) {
								documentKeys = documentKeys.filter(function(key) {
									return DB[query.collection][key][filters[f]] == query.filters[filters[f]]
								})
							}

						// delete
							for (var d in documentKeys) {
								delete DB[query.collection][documentKeys[d]]
							}

						// no documents
							if (!documentKeys.length) {
								callback({success: false, count: 0})
							}

						// yes documents
							callback({success: true, count: documentKeys.length})
							return
					}
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* accessMongo */
		module.exports.accessMongo = accessMongo
		function accessMongo(DB, query, callback) {
			console.log(arguments.callee.name)
			try {
				MONGO.connect(DB, { useUnifiedTopology: true }, function(error, client) {
					// connect
						var db = client.db(ENVIRONMENT.db_name)
						if (error) {
							callback({success: false, message: error})
							client.close()
							return
						}

					// find
						if (query.command == "find") {
							// execute query
								db.collection(query.collection).find(query.filters).toArray(function (error, documents) {
									// error
										if (error) {
											callback({success: false, message: JSON.stringify(error)})
											client.close()
											return
										}

									// no documents
										if (!documents.length) {
											callback({success: false, count: 0, documents: []})
											client.close()
											return
										}

									// yes documents
										callback({success: true, count: documents.length, documents: documents})
										client.close()
										return
								})
						}

					// insert
						if (query.command == "insert") {
							// execute query
								db.collection(query.collection).insertOne(query.document, function (error, results) {
									// error
										if (error) {
											callback({success: false, message: JSON.stringify(error)})
											client.close()
											return
										}

									// success
										callback({success: true, count: results.nInserted, documents: [query.document]})
										client.close()
										return
								})
						}

					// update
						if (query.command == "update") {
							// prevent updating _id
								if (query.document._id) {
									delete query.document._id
								}

							// execute query
								db.collection(query.collection).updateOne(query.filters, {$set: query.document}, function(error, results) {
									// error
										if (error) {
											callback({success: false, message: JSON.stringify(error)})
											client.close()
											return
										}

									// find
										db.collection(query.collection).find(query.filters).toArray(function (error, documents) {
											// error
												if (error) {
													callback({success: false, message: JSON.stringify(error)})
													client.close()
													return
												}

											// no documents
												if (!documents.length) {
													callback({success: false, count: 0, documents: []})
													client.close()
													return
												}

											// yes documents
												callback({success: true, count: documents.length, documents: documents})
												client.close()
												return
										})
								})
						}

					// delete
						if (query.command == "delete") {
							db.collection(query.collection).deleteOne(query.filters, function(error, results) {
								// error
									if (error) {
										callback({success: false, message: JSON.stringify(error)})
										client.close()
										return
									}

								// yes documents
									callback({success: true, count: results.nRemoved})
									client.close()
									return
							})
						}
				})
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** other ***/
	if (!HOME)   { var HOME   = require("../home/logic") }
	if (!USER)   { var USER   = require("../user/logic") }
	if (!DECK)   { var DECK   = require("../deck/logic") }
