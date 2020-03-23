window.addEventListener("load", function() {
	/*** globals ***/
		/* function library */
			window.FUNCTION_LIBRARY = window.FUNCTION_LIBRARY || {}

		/* elements */
			var NAVIGATION              = document.getElementById("navigation")
				var SEARCH_FORM         = document.getElementById("search-form")
					var SEARCH_TEXT     = document.getElementById("search-text")
					var SEARCH_BUTTON   = document.getElementById("search-button")
				var SIGNOUT_FORM        = document.getElementById("signout-form")
					var SIGNOUT_BUTTON  = document.getElementById("signout-button")

			var CONTAINER                    = document.getElementById("container")
				var HEADER                   = document.getElementById("header")
				var GAME_CREATE_FORM         = document.getElementById("game-create-form")
					var GAME_CREATE_BUTTON   = document.getElementById("game-create-button")
					var GAME_CREATE_ERROR    = document.getElementById("game-create-error")
				var ACTIVATE_EDIT_FORM       = document.getElementById("activate-edit-form")
					var ACTIVATE_EDIT_BUTTON = document.getElementById("activate-edit-button")
				var UPDATE_DECK_FORM         = document.getElementById("update-deck-form")
					var UPDATE_DECK_NAME     = document.getElementById("update-deck-name")
					var UPDATE_DECK_BUTTON   = document.getElementById("update-deck-button")
					var UPDATE_DECK_DELETE   = document.getElementById("update-deck-delete")
					var UPDATE_DECK_ERROR    = document.getElementById("update-deck-error")
				var DELETE_DECK_FORM         = document.getElementById("delete-deck-form")
					var DELETE_DECK_BUTTON   = document.getElementById("delete-deck-button")
					var DELETE_DECK_ERROR    = document.getElementById("delete-deck-error")
				var PAIRS                    = document.getElementById("pairs")
				var PAIR_CREATE_FORM         = document.getElementById("pair-create-form")
					var PAIR_CREATE_BUTTON   = document.getElementById("pair-create-button")

			var GAME_CONTAINER               = document.getElementById("game-container")
				var GAME_TABLE               = document.getElementById("game-table")
				var GAME_END_FORM            = document.getElementById("game-end-form")
				var GAME_END_BUTTON          = document.getElementById("game-end-button")

	/*** navigation ***/
		/* submitSearch */
			if (SEARCH_FORM) {
				SEARCH_FORM.addEventListener("submit", submitSearch)
				function submitSearch(event) {
					// validate
						if (!SEARCH_TEXT.value || !SEARCH_TEXT.value.length) {
							return
						}

					// redirect
						window.location = "../../../../search?q=" + SEARCH_TEXT.value
				}
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
						window.FUNCTION_LIBRARY.sendPost(data, function(response) {
							if (!response.success) {
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
					// swap forms
						ACTIVATE_EDIT_FORM.setAttribute("visibility", false)
						GAME_CREATE_FORM.setAttribute("visibility", false)
						UPDATE_DECK_FORM.setAttribute("visibility", true)
						PAIR_CREATE_FORM.setAttribute("visibility", true)

					// hide displays
						var displays = Array.from(document.querySelectorAll(".pair-card-display"))
						for (var i in displays) {
							displays[i].setAttribute("visibility", false)
						}

					// show edits
						var edits = Array.from(document.querySelectorAll(".pair-card-edit"))
						for (var i in edits) {
							edits[i].setAttribute("visibility", true)
						}

					// show deletes
						var deletes = Array.from(document.querySelectorAll(".pair-delete-form"))
						for (var i in deletes) {
							deletes[i].setAttribute("visibility", true)
						}
				}
			}

		/* submitUpdateDeck */
			if (UPDATE_DECK_FORM) {
				UPDATE_DECK_FORM.addEventListener("submit", submitUpdateDeck)
				function submitUpdateDeck(event) {
					// validate
						if (!UPDATE_DECK_NAME.value || !window.FUNCTION_LIBRARY.isNumLet(UPDATE_DECK_NAME.value) || UPDATE_DECK_NAME.value.length < 8) {
							UPDATE_DECK_ERROR.innerText = "deck name must be 8+ numbers and letters"
							return
						}
						window.DECK.name = UPDATE_DECK_NAME.value

					// loop through pairs
						for (var i in window.DECK.pairs) {
							// id
								var id = window.DECK.pairs[i].id
								var pair = document.querySelector(".pair#" + id)

							// cards
								window.DECK.pairs[i].cards[0].text       = pair.querySelector(".pair-card-0").querySelector(".pair-card-input-text").value
								window.DECK.pairs[i].cards[0].background = pair.querySelector(".pair-card-0").querySelector(".pair-card-input-background").value
								window.DECK.pairs[i].cards[0].color      = pair.querySelector(".pair-card-0").querySelector(".pair-card-input-color").value
								window.DECK.pairs[i].cards[1].text       = pair.querySelector(".pair-card-1").querySelector(".pair-card-input-text").value
								window.DECK.pairs[i].cards[1].background = pair.querySelector(".pair-card-1").querySelector(".pair-card-input-background").value
								window.DECK.pairs[i].cards[1].color      = pair.querySelector(".pair-card-1").querySelector(".pair-card-input-color").value
						}

					// data
						var data = {
							action: "updateDeck",
							deck: window.DECK
						}

					// updates
						window.FUNCTION_LIBRARY.sendPost(data, function(response) {
							if (!response.success) {
								UPDATE_DECK_ERROR.innerText = response.message
								return
							}

							if (response.location) {
								window.location = response.location
								return
							}

							// update data
								UPDATE_DECK_ERROR.innerText = ""
								window.DECK = response.deck
								HEADER.innerText = window.DECK.name

							// loop through pairs
								for (var i in window.DECK.pairs) {
									// id
										var id = window.DECK.pairs[i].id
										var pair = document.querySelector(".pair#" + id)

									// cards
										pair.querySelector(".pair-card-0").querySelector(".pair-card-display span").innerText        = (window.DECK.pairs[i].cards[0].text || "")
										pair.querySelector(".pair-card-0").querySelector(".pair-card-display").style.background = (window.DECK.pairs[i].cards[0].background || "#ffffff")
										pair.querySelector(".pair-card-0").querySelector(".pair-card-display").style.color      = (window.DECK.pairs[i].cards[0].color || "#000000")
										pair.querySelector(".pair-card-1").querySelector(".pair-card-display span").innerText        = (window.DECK.pairs[i].cards[1].text || "")
										pair.querySelector(".pair-card-1").querySelector(".pair-card-display").style.background = (window.DECK.pairs[i].cards[1].background || "#ffffff")
										pair.querySelector(".pair-card-1").querySelector(".pair-card-display").style.color      = (window.DECK.pairs[i].cards[1].color || "#000000")
								}

							// hide edits
								// swap forms
									ACTIVATE_EDIT_FORM.setAttribute("visibility", true)
									GAME_CREATE_FORM.setAttribute("visibility", true)
									DELETE_DECK_FORM.setAttribute("visibility", false)
									UPDATE_DECK_FORM.setAttribute("visibility", false)
									PAIR_CREATE_FORM.setAttribute("visibility", false)

								// show displays
									var displays = Array.from(document.querySelectorAll(".pair-card-display"))
									for (var i in displays) {
										displays[i].setAttribute("visibility", true)
									}

								// hide edits
									var edits = Array.from(document.querySelectorAll(".pair-card-edit"))
									for (var i in edits) {
										edits[i].setAttribute("visibility", false)
									}

								// hide deletes
									var deletes = Array.from(document.querySelectorAll(".pair-delete-form"))
									for (var i in deletes) {
										deletes[i].setAttribute("visibility", false)
									}
						})
				}
			}

		/* submitUpdateDelete */
			if (UPDATE_DECK_FORM && DELETE_DECK_FORM) {
				UPDATE_DECK_DELETE.addEventListener("click", submitUpdateDelete)
				function submitUpdateDelete(event) {
					DELETE_DECK_FORM.setAttribute("visibility", true)
				}
			}

		/* submitDeleteDeck */
			if (DELETE_DECK_FORM) {
				DELETE_DECK_FORM.addEventListener("submit", submitDeleteDeck)
				function submitDeleteDeck(event) {
					// data
						var data = {
							action: "deleteDeck",
							deck: window.DECK,
						}

					// updates
						window.FUNCTION_LIBRARY.sendPost(data, function(response) {
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
						var id = window.FUNCTION_LIBRARY.generateRandom()
						var pair = {
							id: id,
							cards: [
								{
									pair: id,
									which: 0,
									text: null,
									background: "#ffffff",
									color: "#000000",
								},
								{
									pair: id,
									which: 1,
									text: null,
									background: "#ffffff",
									color: "#000000"
								}
							]
						}
						window.DECK.pairs.push(pair)

					// new pair element
						var pairElement = document.createElement("div")
							pairElement.id = pair.id
							pairElement.className = "pair"
							pairElement.innerHTML = '<div class="pair-card pair-card-0">' +
									'<div visibility=false class="pair-card-display" style="background: ' + pair.cards[0].background + '; color: ' + pair.cards[0].color + '">' +
										'<span>' + (pair.cards[0].text || "") + '</span>' +
									'</div>' +
									'<div visibility=true class="pair-card-edit">' +
										'<label>text: <input class="pair-card-input-text" type="text" placeholder="text" value="' + (pair.cards[0].text || "") + '"/></label>' +
										'<label>background: <input class="pair-card-input-background" placeholder="background" type="color" value="' + pair.cards[0].background + '"/></label>' +
										'<label>text color: <input class="pair-card-input-color" placeholder="color" type="color" value="' + pair.cards[0].color + '"/></label>' +
									'</div>' +
								'</div>' +
								'<div class="pair-card pair-card-1">' +
									'<div visibility=false class="pair-card-display" style="background: ' + pair.cards[1].background + '; color: ' + pair.cards[1].color + '">' + 
										'<span>' + (pair.cards[1].text || "") + '</span>' +
									'</div>' +
									'<div visibility=true class="pair-card-edit">' +
										'<label>text: <input class="pair-card-input-text" type="text" placeholder="text" value="' + (pair.cards[1].text || "") + '"/></label>' +
										'<label>background: <input class="pair-card-input-background" placeholder="background" type="color" value="' + pair.cards[1].background + '"/></label>' +
										'<label>text color: <input class="pair-card-input-color" placeholder="color" type="color" value="' + pair.cards[1].color + '"/></label>' +
									'</div>' +
								'</div>' +
								'<form method="post" action="javascript:;" visibility=true class="pair-delete-form" onsubmit="window.submitDeletePair(\'' + pair.id + '\')">' +
									'<button class="pair-delete-button">delete pair</button>' +
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
						window.DECK.pairs = window.DECK.pairs.filter(function(p) {
							return p.id !== id
						})
				}
			}

	/*** game ***/
		/* startGame */
			if (GAME_CREATE_FORM) {
				GAME_CREATE_FORM.addEventListener("submit", startGame)
				function startGame() {
					// validate
						if (!window.DECK || !window.DECK.pairs || !window.DECK.pairs.length) {
							GAME_CREATE_ERROR.innerText = "no cards found"
							return
						}

					// clear table
						GAME_CREATE_ERROR.innerText = ""
						GAME_TABLE.innerHTML = ""

					// game
						window.GAME = {
							interactive: false,
							deck: window.FUNCTION_LIBRARY.duplicateObject(window.DECK),
							cards: [],
							revealed: {
								pair: null,
								which: null
							}
						}

					// get cards
						for (var i in window.GAME.deck.pairs) {
							window.GAME.cards.push(window.GAME.deck.pairs[i].cards[0])
							window.GAME.cards.push(window.GAME.deck.pairs[i].cards[1])
						}
						window.GAME.cards = window.FUNCTION_LIBRARY.sortRandom(window.GAME.cards)

					// lay out cards
						for (var i in window.GAME.cards) {
							createGameCard(window.GAME.cards[i])
						}

					// swap containers
						CONTAINER.setAttribute("visibility", false)
						GAME_CONTAINER.setAttribute("visibility", true)

					// start
						window.GAME.interactive = true
				}
			}

		/* createGameCard */
			if (GAME_CREATE_FORM) {
				function createGameCard(card) {
					// element
						var cardElement = document.createElement("button")
							cardElement.className = "game-card"
							cardElement.setAttribute("pair", card.pair)
							cardElement.setAttribute("which", card.which)
							cardElement.setAttribute("visibility", true)
							cardElement.setAttribute("hold-place", true)
							cardElement.addEventListener("click", flipCard)
						GAME_TABLE.appendChild(cardElement)

					// faces
						var cardFrontElement = document.createElement("div")
							cardFrontElement.className = "game-card-front"
							cardFrontElement.setAttribute("visibility", false)
							cardFrontElement.innerHTML = "<span>" + card.text + "</span>"
							cardFrontElement.style.background = card.background
							cardFrontElement.style.color = card.color
						cardElement.appendChild(cardFrontElement)

						var cardBackElement = document.createElement("div")
							cardBackElement.className = "game-card-back"
							cardBackElement.setAttribute("visibility", true)
						cardElement.appendChild(cardBackElement)
				}
			}

		/* flipCard */
			if (GAME_CREATE_FORM) {
				function flipCard(event) {
					// interactive
						if (!window.GAME.interactive) {
							return
						}

					// cardElement
						var cardElement = event.target.closest(".game-card")

					// card
						var pair = cardElement.getAttribute("pair")
						var which = Number(cardElement.getAttribute("which"))
						var card = window.GAME.cards.find(function(c) {
							return c.pair == pair && c.which == which
						})

					// hiding?
						if (cardElement.querySelector(".game-card-front").getAttribute("visibility") == "true") {
							cardElement.querySelector(".game-card-front").setAttribute("visibility", false)
							cardElement.querySelector(".game-card-back" ).setAttribute("visibility", true)

							if (window.GAME.revealed.pair == card.pair && window.GAME.revealed.which == card.which) {
								window.GAME.revealed.pair = window.GAME.revealed.which = null
							}

							return
						}

					// revealing
						if (cardElement.querySelector(".game-card-back").getAttribute("visibility") == "true") {
							cardElement.querySelector(".game-card-back" ).setAttribute("visibility", false)
							cardElement.querySelector(".game-card-front").setAttribute("visibility", true)

							// first card
								if (!window.GAME.revealed.pair) {
									window.GAME.revealed.pair = card.pair
									window.GAME.revealed.which = card.which
									return
								}

							// second card
								testMatch(card, cardElement)
						}
				}
			}

		/* testMatch */
			if (GAME_CREATE_FORM) {
				function testMatch(card, cardElement) {
					// uninteractive
						window.GAME.interactive = false

					// pause for imapct
						setTimeout(function() {
							// not a match --> flip back
								if (window.GAME.revealed.pair !== card.pair) {
									cardElement.querySelector(".game-card-front").setAttribute("visibility", false)
									cardElement.querySelector(".game-card-back" ).setAttribute("visibility", true)

									var unmatchElement = document.querySelector(".game-card[pair='" + window.GAME.revealed.pair + "'][which='" + window.GAME.revealed.which + "']")
										unmatchElement.querySelector(".game-card-front").setAttribute("visibility", false)
										unmatchElement.querySelector(".game-card-back" ).setAttribute("visibility", true)

									window.GAME.revealed.pair = window.GAME.revealed.which = null
									window.GAME.interactive = true
									return
								}

							// match --> remove
								cardElement.setAttribute("visibility", false)

								var matchElement = document.querySelector(".game-card[pair='" + window.GAME.revealed.pair + "'][which='" + window.GAME.revealed.which + "']")
									matchElement.setAttribute("visibility", false)

								window.GAME.revealed.pair = window.GAME.revealed.which = null

							// game over?
								testVictory()
						}, 2000)
				}
			}

		/* testVictory */
			if (GAME_CREATE_FORM) {
				function testVictory() {
					// remaining cards
						var visibleCards = Array.from(document.querySelectorAll(".game-card[visibility=true]"))
						if (visibleCards.length) {
							window.GAME.interactive = true
							return
						}

					// interactive
						endGame()
				}
			}

		/* endGame */
			if (GAME_END_FORM) {
				GAME_END_FORM.addEventListener("submit", endGame)
				function endGame() {
					// uninteractive
						if (window.GAME) {
							window.GAME.interactive = false
						}

					// empty table
						GAME_TABLE.innerHTML = ""

					// swap containers
						CONTAINER.setAttribute("visibility", true)
						GAME_CONTAINER.setAttribute("visibility", false)
				}
			}
})
