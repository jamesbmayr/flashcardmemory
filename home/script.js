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
			var NAVIGATION              = document.getElementById("navigation")
				var SEARCH_FORM         = document.getElementById("search-form")
					var SEARCH_TEXT     = document.getElementById("search-text")
					var SEARCH_BUTTON   = document.getElementById("search-button")
					var SEARCH_ERROR    = document.getElementById("search-error")

			var CONTAINER               = document.getElementById("container")
				var HEADER              = document.getElementById("header")
				var SIGNUP_FORM         = document.getElementById("signup-form")
					var SIGNUP_USERNAME = document.getElementById("signup-username")
					var SIGNUP_PASSWORD = document.getElementById("signup-password")
					var SIGNUP_BUTTON   = document.getElementById("signup-button")
					var SIGNUP_ERROR    = document.getElementById("signup-error")
					var SIGNUP_SWITCH   = document.getElementById("signup-switch")
				var SIGNIN_FORM         = document.getElementById("signin-form")
					var SIGNIN_USERNAME = document.getElementById("signin-username")
					var SIGNIN_PASSWORD = document.getElementById("signin-password")
					var SIGNIN_BUTTON   = document.getElementById("signin-button")
					var SIGNIN_ERROR    = document.getElementById("signin-error")
					var SIGNIN_SWITCH   = document.getElementById("signin-switch")

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

		/* switchSignUp */
			SIGNUP_SWITCH.addEventListener(ON.click, switchSignUp)
			function switchSignUp(event) {
				SIGNUP_FORM.setAttribute("visibility", false)
				SIGNIN_FORM.setAttribute("visibility", true)
			}

		/* switchSignIn */
			SIGNIN_SWITCH.addEventListener(ON.click, switchSignIn)
			function switchSignIn(event) {
				SIGNIN_FORM.setAttribute("visibility", false)
				SIGNUP_FORM.setAttribute("visibility", true)
			}
})