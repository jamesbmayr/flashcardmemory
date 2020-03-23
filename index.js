/*** modules ***/
	var HTTP  = require("http")
	var FS    = require("fs")
	var QS    = require("querystring")

	var MAIN = require("./main/logic")
	var HOME = require("./home/logic")
	var DECK = require("./deck/logic")
	var USER = require("./user/logic")

/*** constants ***/
	var ENVIRONMENT = MAIN.getEnvironment()
	var CONSTANTS   = MAIN.getAsset("constants")

/*** database ***/
	if (ENVIRONMENT.db_url) {
		var DB = "mongodb+srv://" + ENVIRONMENT.db_username + ":" + ENVIRONMENT.db_password + "@" + ENVIRONMENT.db_url
	}
	else {
		var DB = {
			sessions: {},
			users: {},
			decks: {}
		}
	}

/*** server ***/
	var SERVER = HTTP.createServer(handleRequest)
		SERVER.listen(ENVIRONMENT.port, function (error) {
			if (error) {
				MAIN.logError(error)
				return
			}
			
			MAIN.logStatus("listening on port " + ENVIRONMENT.port)
		})

/*** request ***/
	/* handleRequest */
		function handleRequest(REQUEST, RESPONSE) {
			// collect data
				var data = ""
				REQUEST.on("data", function (chunk) { data += chunk })
				REQUEST.on("end", function() {
					parseRequest(REQUEST, RESPONSE, data)
				})
		}

	/* parseRequest */
		function parseRequest(REQUEST, RESPONSE, data) {
			try {
				// get request info
					REQUEST.get    = QS.parse(REQUEST.url.split("?")[1]) || {}
					REQUEST.path   = REQUEST.url.split("?")[0].split("/") || []
					REQUEST.url    = REQUEST.url.split("?")[0] || "/"
					REQUEST.post   = data ? JSON.parse(data) : {}
					REQUEST.cookie = REQUEST.headers.cookie ? QS.parse(REQUEST.headers.cookie.replace(/; /g, "&")) : {}
					REQUEST.ip     = REQUEST.headers["x-forwarded-for"] || REQUEST.connection.remoteAddress || REQUEST.socket.remoteAddress || REQUEST.connection.socket.remoteAddress
					REQUEST.contentType = MAIN.getContentType(REQUEST.url)
					REQUEST.fileType = (/[.]([a-zA-Z0-9])+$/).test(REQUEST.url) ? REQUEST.path[REQUEST.path.length - 1] : null

				// log it
					if (REQUEST.url !== "/favicon.ico") {
						MAIN.logStatus((REQUEST.cookie.session || "new") + " @ " + REQUEST.ip + "\n[" + REQUEST.method + "] " + REQUEST.path.join("/") + "\n" + JSON.stringify(REQUEST.method == "GET" ? REQUEST.get : Object.keys(REQUEST.post)))
					}
					
				// session
					if (REQUEST.fileType) {
						routeRequest(REQUEST, RESPONSE)
						return
					}

					MAIN.readSession(REQUEST, RESPONSE, DB, routeRequest)
			}
			catch (error) {_403(REQUEST, RESPONSE, "unable to parse request")}
		}

	/* routeRequest */
		function routeRequest(REQUEST, RESPONSE) {
			try {
				// get
					if (REQUEST.method == "GET") {
						switch (true) {
							// favicon
								case (/\/favicon[.]ico$/).test(REQUEST.url):
								case (/\/icon[.]png$/).test(REQUEST.url):
								case (/\/apple\-touch\-icon[.]png$/).test(REQUEST.url):
								case (/\/apple\-touch\-icon\-precomposed[.]png$/).test(REQUEST.url):
								case (/\/logo[.]png$/).test(REQUEST.url):
									try {
										RESPONSE.writeHead(200, {"Content-Type": REQUEST.contentType})
										FS.readFile("./main/logo.png", function (error, file) {
											if (error) {
												_404(REQUEST, RESPONSE, error)
												return
											}
											
											RESPONSE.end(file, "binary")
										})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break

							// asset
								case (/[.]([a-zA-Z0-9])+$/).test(REQUEST.url):
									try {
										RESPONSE.writeHead(200, {"Content-Type": REQUEST.contentType})
										FS.readFile("./" + REQUEST.path.join("/"), function (error, file) {
											if (error) {
												_404(REQUEST, RESPONSE, error)
												return
											}
											
											RESPONSE.end(file, "binary")
										})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break
						
							// home
								case (/^\/?$/).test(REQUEST.url):
									try {
										if (REQUEST.session.user && REQUEST.session.user.username) {
											_302(REQUEST, RESPONSE, "/user/" + REQUEST.session.user.username)
											return
										}

										RESPONSE.writeHead(200, {
											"Set-Cookie": String("session=" + REQUEST.session.id + "; expires=" + (new Date(new Date().getTime() + ENVIRONMENT.cookieLength).toUTCString()) + "; path=/; domain=" + ENVIRONMENT.domain),
											"Content-Type": "text/html; charset=utf-8"
										})
										MAIN.renderHTML(REQUEST, "./home/index.html", function (html) {
											RESPONSE.end(html)
										})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break

							// user
								case (/^\/user\/([a-zA-Z0-9])+$/).test(REQUEST.url):
									try {
										REQUEST.post = {username: REQUEST.path[REQUEST.path.length - 1]}
										USER.readUser(REQUEST, RESPONSE, DB, function(results) {
											if (!results.success) {
												_404(REQUEST, RESPONSE, "unknown error reading user " + REQUEST.path[REQUEST.path.length - 1])
												return
											}

											RESPONSE.writeHead(200, {
												"Set-Cookie": String("session=" + REQUEST.session.id + "; expires=" + (new Date(new Date().getTime() + ENVIRONMENT.cookieLength).toUTCString()) + "; path=/; domain=" + ENVIRONMENT.domain),
												"Content-Type": "text/html; charset=utf-8"
											})
											MAIN.renderHTML(REQUEST, "./user/index.html", function (html) {
												RESPONSE.end(html)
											})
										})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break
								case (/^\/user\/?$/).test(REQUEST.url):
									_302(REQUEST, RESPONSE, "/")
								break

							// deck
								case (/^\/deck\/([a-zA-Z0-9])+$/).test(REQUEST.url):
									try {
										REQUEST.post = {name: REQUEST.path[REQUEST.path.length - 1]}
										DECK.readDeck(REQUEST, RESPONSE, DB, function(results) {
											if (!results.success) {
												_404(REQUEST, RESPONSE, "unknown error reading deck " + REQUEST.path[REQUEST.path.length - 1])
												return
											}

											RESPONSE.writeHead(200, {
												"Set-Cookie": String("session=" + REQUEST.session.id + "; expires=" + (new Date(new Date().getTime() + ENVIRONMENT.cookieLength).toUTCString()) + "; path=/; domain=" + ENVIRONMENT.domain),
												"Content-Type": "text/html; charset=utf-8"
											})
											MAIN.renderHTML(REQUEST, "./deck/index.html", function (html) {
												RESPONSE.end(html)
											})
										})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break
								case (/^\/deck\/?$/).test(REQUEST.url):
									_302(REQUEST, RESPONSE, "/")
								break

							// data
								case (/^\/data$/).test(REQUEST.url):
									try {
										RESPONSE.writeHead(200, {
											"Content-Type": "text/plain; charset=utf-8"
										})
										RESPONSE.end(JSON.stringify(DB, null, 2))
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break

							// other
								default:
									_404(REQUEST, RESPONSE, REQUEST.url)
								break
						}
					}

				// post
					else if (REQUEST.method == "POST" && REQUEST.post.action) {
						switch (REQUEST.post.action) {
							// home
								// signUp
									case "signUp":
										try {
											RESPONSE.writeHead(200, {"Content-Type": "text/json"})
											HOME.signUp(REQUEST, RESPONSE, DB, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

								// signIn
									case "signIn":
										try {
											RESPONSE.writeHead(200, {"Content-Type": "text/json"})
											HOME.signIn(REQUEST, RESPONSE, DB, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

								// signOut
									case "signOut":
										try {
											RESPONSE.writeHead(200, {"Content-Type": "text/json"})
											HOME.signOut(REQUEST, RESPONSE, DB, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

							// user
								// createUser
									case "createUser":
										try {
											RESPONSE.writeHead(200, {"Content-Type": "text/json"})
											USER.createUser(REQUEST, RESPONSE, DB, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

								// updateUsername
									case "updateUsername":
										try {
											RESPONSE.writeHead(200, {"Content-Type": "text/json"})
											USER.updateUsername(REQUEST, RESPONSE, DB, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

								// updatePassword
									case "updatePassword":
										try {
											RESPONSE.writeHead(200, {"Content-Type": "text/json"})
											USER.updatePassword(REQUEST, RESPONSE, DB, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

								// deleteUser
									case "deleteUser":
										try {
											RESPONSE.writeHead(200, {"Content-Type": "text/json"})
											USER.deleteUser(REQUEST, RESPONSE, DB, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

							// deck
								// createDeck
									case "createDeck":
										try {
											RESPONSE.writeHead(200, {"Content-Type": "text/json"})
											DECK.createDeck(REQUEST, RESPONSE, DB, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

								// updateDeck
									case "updateDeck":
										try {
											RESPONSE.writeHead(200, {"Content-Type": "text/json"})
											DECK.updateDeck(REQUEST, RESPONSE, DB, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

								// deleteDeck
									case "deleteDeck":
										try {
											RESPONSE.writeHead(200, {"Content-Type": "text/json"})
											DECK.deleteDeck(REQUEST, RESPONSE, DB, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

							// others
								default:
									_403(REQUEST, RESPONSE)
								break
						}
					}

				// others
					else {_403(REQUEST, RESPONSE, "unknown route")}
			}
			catch (error) {_403(REQUEST, RESPONSE, "unable to route request")}
		}

	/* _302 */
		function _302(REQUEST, RESPONSE, data) {
			MAIN.logStatus("redirecting to " + (data || "/"))
			RESPONSE.writeHead(302, { Location: data || "../../../../" })
			RESPONSE.end()
		}

	/* _403 */
		function _403(REQUEST, RESPONSE, data) {
			MAIN.logError(data)
			RESPONSE.writeHead(403, { "Content-Type": "text/json" })
			RESPONSE.end( JSON.stringify({success: false, error: data}) )
		}

	/* _404 */
		function _404(REQUEST, RESPONSE, data) {
			MAIN.logError(data)
			RESPONSE.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
			MAIN.renderHTML(REQUEST, "./main/_404.html", function (html) {
				RESPONSE.end(html)
			})
		}
