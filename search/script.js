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

			var CONTAINER               = document.getElementById("container")
				var SEARCH_RESULTS      = document.getElementById("search-results")

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
})
