window.addEventListener("load", function() {
	/*** globals ***/
		/* function library */
			window.FUNCTION_LIBRARY = window.FUNCTION_LIBRARY || {}

		/* elements */
			var NAVIGATION              = document.getElementById("navigation")
				var SEARCH_FORM         = document.getElementById("search-form")
					var SEARCH_TEXT     = document.getElementById("search-text")
					var SEARCH_BUTTON   = document.getElementById("search-button")

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
		/* submitSignUp */
			if (SIGNUP_FORM) {
				SIGNUP_FORM.addEventListener("submit", submitSignUp)
				function submitSignUp(event) {
					// validate
						if (!SIGNUP_USERNAME.value || !window.FUNCTION_LIBRARY.isNumLet(SIGNUP_USERNAME.value) || SIGNUP_USERNAME.value.length < 8) {
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
						window.FUNCTION_LIBRARY.sendPost(data, function(response) {
							if (!response.success) {
								SIGNUP_ERROR.innerText = response.message
								return
							}

							window.location = response.location
						})
				}
			}

		/* submitSignIn */
			if (SIGNIN_FORM) {
				SIGNIN_FORM.addEventListener("submit", submitSignIn)
				function submitSignIn(event) {
					// validate
						if (!SIGNIN_USERNAME.value || !window.FUNCTION_LIBRARY.isNumLet(SIGNIN_USERNAME.value) || SIGNIN_USERNAME.value.length < 8) {
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
						window.FUNCTION_LIBRARY.sendPost(data, function(response) {
							if (!response.success) {
								SIGNIN_ERROR.innerText = response.message
								return
							}

							window.location = response.location
						})
				}
			}

		/* switchSignUp */
			if (SIGNUP_SWITCH) {
				SIGNUP_SWITCH.addEventListener("click", switchSignUp)
				function switchSignUp(event) {
					SIGNUP_FORM.setAttribute("visibility", false)
					SIGNIN_FORM.setAttribute("visibility", true)
				}
			}

		/* switchSignIn */
			if (SIGNIN_SWITCH) {
				SIGNIN_SWITCH.addEventListener("click", switchSignIn)
				function switchSignIn(event) {
					SIGNIN_FORM.setAttribute("visibility", false)
					SIGNUP_FORM.setAttribute("visibility", true)
				}
			}
})
