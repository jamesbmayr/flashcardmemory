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
			var SIGNUP_FORM     = document.getElementById("signup-form")
			var SIGNUP_USERNAME = document.getElementById("signup-username")
			var SIGNUP_PASSWORD = document.getElementById("signup-password")
			var SIGNUP_BUTTON   = document.getElementById("signup-button")
			var SIGNUP_ERROR    = document.getElementById("signup-error")
			var SIGNUP_SWITCH   = document.getElementById("signup-switch")

			var SIGNIN_FORM     = document.getElementById("signin-form")
			var SIGNIN_USERNAME = document.getElementById("signin-username")
			var SIGNIN_PASSWORD = document.getElementById("signin-password")
			var SIGNIN_BUTTON   = document.getElementById("signin-button")
			var SIGNIN_ERROR    = document.getElementById("signin-error")
			var SIGNIN_SWITCH   = document.getElementById("signin-switch")

			var SIGNOUT_FORM    = document.getElementById("signout-form")
			var SIGNOUT_BUTTON  = document.getElementById("signout-button")
			var SIGNOUT_ERROR   = document.getElementById("signout-error")

			var SEARCH_FORM     = document.getElementById("search-form")
			var SEARCH_TEXT     = document.getElementById("search-username")
			var SEARCH_BUTTON   = document.getElementById("search-password")
			var SEARCH_ERROR    = document.getElementById("search-error")

			var CHANGE_USERNAME_FORM     = document.getElementById("change-username-form")
			var CHANGE_USERNAME_USERNAME = document.getElementById("change-username-username")
			var CHANGE_USERNAME_BUTTON   = document.getElementById("change-username-button")
			var CHANGE_USERNAME_ERROR    = document.getElementById("change-username-error")

			var CHANGE_PASSWORD_FORM     = document.getElementById("change-password-form")
			var CHANGE_PASSWORD_OLD      = document.getElementById("change-password-old")
			var CHANGE_PASSWORD_NEW      = document.getElementById("change-password-new")
			var CHANGE_PASSWORD_BUTTON   = document.getElementById("change-password-button")
			var CHANGE_PASSWORD_ERROR    = document.getElementById("change-password-error")

	/*** authentication ***/
		/* submitSignUp */
			SIGNUP_FORM.addEventListener("submit", submitSignUp)
			function submitSignUp(event) {
				// validate
					if (!SIGNUP_USERNAME.value || !isNumLet(SIGNUP_USERNAME.value) || SIGNUP_USERNAME.value.length < 8) {
						SIGNUP_ERROR.innerText = "username must be 8+ numbers and letters"
						return
					}
					if (!SIGNUP_PASSWORD.value || SIGNUP_PASSWORD.value.length < 8) {
						SIGNUP_ERROR.innerText = "password must be 8+ characters"
						return
					}

				// data
					var data = {
						action: "signUp",
						username: SIGNUP_USERNAME.value,
						password: SIGNUP_PASSWORD.value
					}

				// authenticate
					sendPost(data, function(response) {
						if (!response.success) {
							SIGNUP_ERROR.innerText = response.message
							return
						}

						window.location = response.location
					})
			}

		/* submitSignIn */
			SIGNIN_FORM.addEventListener("submit", submitSignIn)
			function submitSignIn(event) {
				// validate
					if (!SIGNIN_USERNAME.value || !isNumLet(SIGNIN_USERNAME.value) || SIGNIN_USERNAME.value.length < 8) {
						SIGNIN_ERROR.innerText = "username must be 8+ numbers and letters"
						return
					}
					if (!SIGNIN_PASSWORD.value || SIGNIN_PASSWORD.value.length < 8) {
						SIGNIN_ERROR.innerText = "password must be 8+ characters"
						return
					}

				// data
					var data = {
						action: "signIn",
						username: SIGNIN_USERNAME.value,
						password: SIGNIN_PASSWORD.value
					}

				// authenticate
					sendPost(data, function(response) {
						if (!response.success) {
							SIGNIN_ERROR.innerText = response.message
							return
						}

						window.location = response.location
					})
			}

		/* submitSignOut */
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

		/* switchSignUp */
			SIGNUP_SWITCH.addEventListener(ON.click, switchSignUp)
			function switchSignUp(event) {
				SIGNUP_FORM.setAttribute("visible", false)
				SIGNIN_FORM.setAttribute("visible", true)
			}

		/* switchSignIn */
			SIGNIN_SWITCH.addEventListener(ON.click, switchSignIn)
			function switchSignIn(event) {
				SIGNIN_FORM.setAttribute("visible", false)
				SIGNUP_FORM.setAttribute("visible", true)
			}

	/*** search ***/
		/* submitSearch */
			function submitSearch(event) {				
				// validate
					if (!SEARCH_TEXT.value || !isNumLet(SEARCH_TEXT.value)) {
						SEARCH_ERROR.innerText = "invalid search"
						return
					}

				// redirect
					window.location = "/" + SEARCH_TEXT.value
			}

	/*** change ***/
		/* submitChangeUsername */
			CHANGE_USERNAME_FORM.addEventListener("submit", submitChangeUsername)
			function submitChangeUsername(event) {
				// validate
					if (!CHANGE_USERNAME_USERNAME.value || !isNumLet(CHANGE_USERNAME_USERNAME.value) || CHANGE_USERNAME_USERNAME.value.length < 8) {
						CHANGE_USERNAME_ERROR.innerText = "username must be 8+ numbers and letters"
						return
					}

				// data
					var data = {
						action: "changeUsername",
						username: CHANGE_USERNAME_USERNAME.value
					}

				// updates
					sendPost(data, function(response) {
						if (!response.success) {
							CHANGE_USERNAME_ERROR.innerText = response.message
							return
						}

						CHANGE_USERNAME_ERROR.innerText = response.message
						CHANGE_USERNAME_USERNAME.value = null
					})
			}

		/* submitChangePassword */
			CHANGE_PASSWORD_FORM.addEventListener("submit", submitChangePassword)
			function submitChangePassword(event) {
				// validate
					if (!CHANGE_PASSWORD_OLD.value || CHANGE_PASSWORD_OLD.value.length < 8) {
						CHANGE_PASSWORD_ERROR.innerText = "password must be 8+ characters"
						return
					}

					if (!CHANGE_PASSWORD_NEW.value || CHANGE_PASSWORD_NEW.value.length < 8) {
						CHANGE_PASSWORD_ERROR.innerText = "password must be 8+ characters"
						return
					}

				// data
					var data = {
						action: "changePassword",
						old: CHANGE_PASSWORD_OLD.value,
						new: CHANGE_PASSWORD_NEW.value
					}

				// updates
					sendPost(data, function(response) {
						if (!response.success) {
							CHANGE_PASSWORD_ERROR.innerText = response.message
							return
						}

						CHANGE_PASSWORD_ERROR.innerText = response.message
						CHANGE_PASSWORD_OLD.value = null
						CHANGE_PASSWORD_NEW.value = null
					})
			}

	/*** communication ***/
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

	/*** helpers ***/
		/* isNumLet */
			function isNumLet(string) {
				return (/^[a-zA-Z0-9]+$/).test(string)
			}
})