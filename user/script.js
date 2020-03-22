window.addEventListener("load", function() {
	/*** globals ***/
		/* function library */
			window.FUNCTION_LIBRARY = window.FUNCTION_LIBRARY || {}

		/* elements */
			var NAVIGATION              = document.getElementById("navigation")
				var SEARCH_FORM         = document.getElementById("search-form")
					var SEARCH_TEXT     = document.getElementById("search-text")
					var SEARCH_BUTTON   = document.getElementById("search-button")
					var SEARCH_ERROR    = document.getElementById("search-error")
				var SIGNOUT_FORM        = document.getElementById("signout-form")
					var SIGNOUT_BUTTON  = document.getElementById("signout-button")

			var CONTAINER                        = document.getElementById("container")
				var HEADER                       = document.getElementById("header")
				var UPDATE_USERNAME_FORM         = document.getElementById("update-username-form")
					var UPDATE_USERNAME_USERNAME = document.getElementById("update-username-username")
					var UPDATE_USERNAME_BUTTON   = document.getElementById("update-username-button")
					var UPDATE_USERNAME_ERROR    = document.getElementById("update-username-error")
				var UPDATE_PASSWORD_FORM         = document.getElementById("update-password-form")
					var UPDATE_PASSWORD_OLD      = document.getElementById("update-password-old")
					var UPDATE_PASSWORD_NEW      = document.getElementById("update-password-new")
					var UPDATE_PASSWORD_BUTTON   = document.getElementById("update-password-button")
					var UPDATE_PASSWORD_ERROR    = document.getElementById("update-password-error")
				var DELETE_USER_FORM             = document.getElementById("delete-user-form")
					var DELETE_USER_PASSWORD     = document.getElementById("delete-user-password")
					var DELETE_USER_BUTTON       = document.getElementById("delete-user-button")
					var DELETE_USER_ERROR        = document.getElementById("delete-user-error")
				var CREATE_DECK_FORM             = document.getElementById("create-deck-form")
					var CREATE_DECK_NAME         = document.getElementById("create-deck-name")
					var CREATE_DECK_BUTTON       = document.getElementById("create-deck-button")
					var CREATE_DECK_ERROR        = document.getElementById("create-deck-error")

	/*** navigation ***/
		/* submitSearch */
			if (SEARCH_FORM) {
				SEARCH_FORM.addEventListener("submit", submitSearch)
				function submitSearch(event) {
					// validate
						if (!SEARCH_TEXT.value || !window.FUNCTION_LIBRARY.isNumLet(SEARCH_TEXT.value) || SEARCH_TEXT.value.length < 8) {
							SEARCH_ERROR.innerText = "deck names must be 8+ numbers and letters"
							return
						}

					// redirect
						window.location = "/deck/" + SEARCH_TEXT.value
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

	/*** user ***/
		/* submitUpdateUsername */
			if (UPDATE_USERNAME_FORM) {
				UPDATE_USERNAME_FORM.addEventListener("submit", submitUpdateUsername)
				function submitUpdateUsername(event) {
					// validate
						if (!UPDATE_USERNAME_USERNAME.value || !window.FUNCTION_LIBRARY.isNumLet(UPDATE_USERNAME_USERNAME.value) || UPDATE_USERNAME_USERNAME.value.length < 8) {
							UPDATE_USERNAME_ERROR.innerText = "username must be 8+ numbers and letters"
							return
						}

					// data
						var data = {
							action: "updateUsername",
							username: UPDATE_USERNAME_USERNAME.value
						}

					// updates
						window.FUNCTION_LIBRARY.sendPost(data, function(response) {
							if (!response.success) {
								UPDATE_USERNAME_ERROR.innerText = response.message
								return
							}

							window.location = response.location
						})
				}
			}

		/* submitUpdatePassword */
			if (UPDATE_PASSWORD_FORM) {
				UPDATE_PASSWORD_FORM.addEventListener("submit", submitUpdatePassword)
				function submitUpdatePassword(event) {
					// validate
						if (!UPDATE_PASSWORD_OLD.value || UPDATE_PASSWORD_OLD.value.length < 8) {
							UPDATE_PASSWORD_ERROR.innerText = "password must be 8+ characters"
							return
						}
						if (!UPDATE_PASSWORD_NEW.value || UPDATE_PASSWORD_NEW.value.length < 8) {
							UPDATE_PASSWORD_ERROR.innerText = "password must be 8+ characters"
							return
						}

					// data
						var data = {
							action: "updatePassword",
							old: UPDATE_PASSWORD_OLD.value,
							new: UPDATE_PASSWORD_NEW.value
						}

					// updates
						window.FUNCTION_LIBRARY.sendPost(data, function(response) {
							if (!response.success) {
								UPDATE_PASSWORD_ERROR.innerText = response.message
								return
							}

							UPDATE_PASSWORD_ERROR.innerText = response.message
							UPDATE_PASSWORD_OLD.value = null
							UPDATE_PASSWORD_NEW.value = null
						})
				}
			}

		/* submitDeleteUser */
			if (DELETE_USER_FORM) {
				DELETE_USER_FORM.addEventListener("submit", submitDeleteUser)
				function submitDeleteUser(event) {
					// validate
						if (!DELETE_USER_PASSWORD.value || DELETE_USER_PASSWORD.value.length < 8) {
							DELETE_USER_ERROR.innerText = "password must be 8+ characters"
							return
						}

					// data
						var data = {
							action: "deleteUser",
							password: DELETE_USER_PASSWORD.value,
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

	/*** decks ***/
		/* submitCreateDeck */
			if (CREATE_DECK_FORM) {
				CREATE_DECK_FORM.addEventListener("submit", submitCreateDeck)
				function submitCreateDeck(event) {
					// validate
						if (!CREATE_DECK_NAME.value || !window.FUNCTION_LIBRARY.isNumLet(CREATE_DECK_NAME.value) || CREATE_DECK_NAME.value.length < 8) {
							CREATE_DECK_ERROR.innerText = "deck name must be 8+ numbers and letters"
							return
						}

					// data
						var data = {
							action: "createDeck",
							name: CREATE_DECK_NAME.value
						}

					// updates
						window.FUNCTION_LIBRARY.sendPost(data, function(response) {
							if (!response.success) {
								CREATE_DECK_ERROR.innerText = response.message
								return
							}

							window.location = response.location
						})
				}
			}
})