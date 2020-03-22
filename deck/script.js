window.addEventListener("load", function() {
	/*** globals ***/
		/* triggers */
			if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)) {
				var ON = { click: "touchstart", mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" }
			}
			else {
				var ON = { click:      "click", mousedown:  "mousedown", mousemove: "mousemove", mouseup:  "mouseup" }
			}

		/* elements */
			var SEARCH_FORM     = document.getElementById("search-form")
			var SEARCH_TEXT     = document.getElementById("search-text")
			var SEARCH_BUTTON   = document.getElementById("search-button")
			var SEARCH_ERROR    = document.getElementById("search-error")

			var SIGNOUT_FORM    = document.getElementById("signout-form")
			var SIGNOUT_BUTTON  = document.getElementById("signout-button")
			var SIGNOUT_ERROR   = document.getElementById("signout-error")

			var HEADER          = document.getElementById("header")

			var ACTIVATE_EDIT_FORM   = document.getElementById("activate-edit-form")
			var ACTIVATE_EDIT_BUTTON = document.getElementById("activate-edit-button")

			var UPDATE_DECK_FORM   = document.getElementById("update-deck-form")
			var UPDATE_DECK_NAME   = document.getElementById("update-deck-name")
			var UPDATE_DECK_BUTTON = document.getElementById("update-deck-button")
			var UPDATE_DECK_ERROR  = document.getElementById("update-deck-error")

			var DELETE_DECK_FORM   = document.getElementById("delete-deck-form")
			var DELETE_DECK_BUTTON = document.getElementById("delete-deck-button")
			var DELETE_DECK_ERROR  = document.getElementById("delete-deck-error")

			var PAIRS              = document.getElementById("pairs")

			var PAIR_CREATE_FORM   = document.getElementById("pair-create-form")
			var PAIR_CREATE_BUTTON = document.getElementById("pair-create-button")

	/*** helpers ***/
		/* sendPost */
			function sendPost(options, callback) {
				// create request object and send to server
					var request = new XMLHttpRequest()
						request.open("POST", location.pathname, true)
						request.onload = function() {
							if (request.readyState !== XMLHttpRequest.DONE || request.status !== 200) {
								callback({success: false, readyState: request.readyState, message: request.status})
								return
							}
							
							callback(JSON.parse(request.responseText) || {success: false, message: "unknown error"})
						}
						request.send(JSON.stringify(options))
			}
			
		/* isNumLet */
			function isNumLet(string) {
				return (/^[a-zA-Z0-9]+$/).test(string)
			}

		/* generateRandom */
			function generateRandom(set, length) {
				set = set || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
				length = length || 32
				
				var output = ""
				for (var i = 0; i < length; i++) {
					output += (set[Math.floor(Math.random() * set.length)])
				}

				return output
			}

	/*** navigation ***/
		/* submitSearch */
			SEARCH_FORM.addEventListener("submit", submitSearch)
			function submitSearch(event) {
				// validate
					if (!SEARCH_TEXT.value || !isNumLet(SEARCH_TEXT.value) || SEARCH_TEXT.value.length < 8) {
						SEARCH_ERROR.innerText = "deck names must be 8+ numbers and letters"
						return
					}

				// redirect
					window.location = "/deck/" + SEARCH_TEXT.value
			}

	/*** authentication ***/
		/* submitSignOut */
			if (SIGNOUT_FORM) {
				SIGNOUT_FORM.addEventListener("submit", submitSignOut)
				function submitSignOut(event) {
					// data
						var data = {
							action: "signOut"
						}

					// un-authenticate
						sendPost(data, function(response) {
							if (!response.success) {
								SIGNOUT_ERROR.innerText = response.message
								return
							}

							window.location = response.location
						})
				}
			}

	/*** deck ***/
		/* activateEdit */
			if (ACTIVATE_EDIT_FORM) {
				ACTIVATE_EDIT_FORM.addEventListener("submit", activateEdit)
				function activateEdit(event) {
					// edit & deck form
						ACTIVATE_EDIT_FORM.setAttribute("visibility", false)
						UPDATE_DECK_FORM.setAttribute("visibility", true)

					// hide displays
						var displays = Array.from(document.querySelectorAll(".pair-card-display"))
						for (var i in displays) {
							displays[i].setAttribute("visibility", false)
						}

					// show inputs
						var inputs = Array.from(document.querySelectorAll(".pair input"))
						for (var i in inputs) {
							inputs[i].setAttribute("visibility", true)
						}

					// show deletes
						var deletes = Array.from(document.querySelectorAll(".pair-delete-form"))
						for (var i in deletes) {
							deletes[i].setAttribute("visibility", true)
						}

					// show create
						PAIR_CREATE_FORM.setAttribute("visibility", true)
				}
			}

		/* submitUpdateDeck */
			if (UPDATE_DECK_FORM) {
				UPDATE_DECK_FORM.addEventListener("submit", submitUpdateDeck)
				function submitUpdateDeck(event) {
					// validate
						if (!UPDATE_DECK_NAME.value || !isNumLet(UPDATE_DECK_NAME.value) || UPDATE_DECK_NAME.value.length < 8) {
							UPDATE_DECK_ERROR.innerText = "deck name must be 8+ numbers and letters"
							return
						}
						window.deck.name = UPDATE_DECK_NAME.value

					// loop through pairs
						for (var i in window.deck.pairs) {
							// id
								var id = window.deck.pairs[i].id
								var pair = document.querySelector(".pair#" + id)

							// cards
								window.deck.pairs[i].cards[0].text       = pair.querySelector(".pair-card-0").querySelector(".pair-card-input-text").value
								window.deck.pairs[i].cards[0].background = pair.querySelector(".pair-card-0").querySelector(".pair-card-input-background").value
								window.deck.pairs[i].cards[1].text       = pair.querySelector(".pair-card-1").querySelector(".pair-card-input-text").value
								window.deck.pairs[i].cards[1].background = pair.querySelector(".pair-card-1").querySelector(".pair-card-input-background").value
						}

					// data
						var data = {
							action: "updateDeck",
							deck: window.deck
						}

					// updates
						sendPost(data, function(response) {
							if (!response.success) {
								UPDATE_DECK_ERROR.innerText = response.message
								return
							}

							if (response.location) {
								window.location = response.location
								return
							}

							// update data
								window.deck = response.deck
								HEADER.innerText = window.deck.name

							// loop through pairs
								for (var i in window.deck.pairs) {
									// id
										var id = window.deck.pairs[i].id
										var pair = document.querySelector(".pair#" + id)

									// cards
										pair.querySelector(".pair-card-0").querySelector(".pair-card-display").innerText        = (window.deck.pairs[i].cards[0].text || "")
										pair.querySelector(".pair-card-0").querySelector(".pair-card-display").style.background = (window.deck.pairs[i].cards[0].background || "white")
										pair.querySelector(".pair-card-1").querySelector(".pair-card-display").innerText        = (window.deck.pairs[i].cards[1].text || "")
										pair.querySelector(".pair-card-1").querySelector(".pair-card-display").style.background = (window.deck.pairs[i].cards[1].background || "white")
								}

							// hide edits
								// edit & deck form
									ACTIVATE_EDIT_FORM.setAttribute("visibility", true)
									UPDATE_DECK_FORM.setAttribute("visibility", false)

								// show displays
									var displays = Array.from(document.querySelectorAll(".pair-card-display"))
									for (var i in displays) {
										displays[i].setAttribute("visibility", true)
									}

								// show inputs
									var inputs = Array.from(document.querySelectorAll(".pair input"))
									for (var i in inputs) {
										inputs[i].setAttribute("visibility", false)
									}

								// show deletes
									var deletes = Array.from(document.querySelectorAll(".pair-delete-form"))
									for (var i in deletes) {
										deletes[i].setAttribute("visibility", false)
									}

								// show create
									PAIR_CREATE_FORM.setAttribute("visibility", false)
						})
				}
			}

		/* submitDeleteDeck */
			if (DELETE_DECK_FORM) {
				DELETE_DECK_FORM.addEventListener("submit", submitDeleteDeck)
				function submitDeleteDeck(event) {
					// data
						var data = {
							action: "deleteDeck",
							deck: window.deck,
						}

					// updates
						sendPost(data, function(response) {
							if (!response.success) {
								DELETE_USER_ERROR.innerText = response.message
								return
							}

							window.location = response.location
						})
				}
			}

	/*** pairs ***/
		/* submitCreatePair */
			if (PAIR_CREATE_FORM) {
				PAIR_CREATE_FORM.addEventListener("submit", submitCreatePair)
				function submitCreatePair(event) {
					// add pair to object
						var pair = {
							id: generateRandom(),
							cards: [
								{
									text: null,
									background: "white",
									color: "black",
								},
								{
									text: null,
									background: "white",
									color: "black"
								}
							]
						}
						window.deck.pairs.push(pair)

					// new pair element
						var pairElement = document.createElement("div")
							pairElement.id = pair.id
							pairElement.className = "pair"
							pairElement.innerHTML = '<div class="pair-card pair-card-0">' +
									'<div visibility=false class="pair-card-display" style="background: ' + pair.cards[0].background + '; color: ' + pair.cards[0].color + '">' + (pair.cards[0].text || "") + '</div>' +
									'<input visibility=true class="pair-card-input-text" placeholder="text" value="' + (pair.cards[0].text || "") + '"/>' +
									'<input visibility=true class="pair-card-input-background" placeholder="background" value="' + pair.cards[0].background + '"/>' +
									'<input visibility=true class="pair-card-input-color" placeholder="color" value="' + pair.cards[0].color + '"/>' +
								'</div>' +
								'<div class="pair-card pair-card-1">' +
									'<div visibility=false class="pair-card-display" style="background: ' + pair.cards[1].background + '; color: ' + pair.cards[1].color + '">' + (pair.cards[1].text || "") + '</div>' +
									'<input visibility=true class="pair-card-input-text" placeholder="text" value="' + (pair.cards[1].text || "") + '"/>' +
									'<input visibility=true class="pair-card-input-background" placeholder="background" value="' + pair.cards[1].background + '"/>' +
									'<input visibility=true class="pair-card-input-color" placeholder="color" value="' + pair.cards[1].color + '"/>' +
								'</div>' +
								'<form method="post" action="javascript:;" visibility=true class="pair-delete-form" onsubmit="window.submitDeletePair(\'' + pair.id + '\')">' +
									'<button class="pair-delete-button">x</button>' +
								'</form>'
						PAIRS.appendChild(pairElement)
				}
			}

		/* submitDeletePair */
			if (UPDATE_DECK_FORM) {
				window.submitDeletePair = submitDeletePair
				function submitDeletePair(id) {
					// get pair
						var pair = document.querySelector(".pair#" + id)
							pair.remove()

					// remove from object
						window.deck.pairs = window.deck.pairs.filter(function(p) {
							return p.id !== id
						})
				}
			}
})
