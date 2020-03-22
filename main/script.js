window.addEventListener("load", function() {
	/*** globals ***/
		/* function library */
			window.FUNCTION_LIBRARY = window.FUNCTION_LIBRARY || {}

	/*** checks ***/
		/* isNumLet */
			window.FUNCTION_LIBRARY.isNumLet = isNumLet
			function isNumLet(string) {
				return (/^[a-zA-Z0-9]+$/).test(string)
			}

	/*** tools ***/
		/* sendPost */
			window.FUNCTION_LIBRARY.sendPost = sendPost
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

		/* duplicateObject */
			window.FUNCTION_LIBRARY.duplicateObject = duplicateObject
			function duplicateObject(object) {
				return JSON.parse(JSON.stringify(object))
			}

	/*** randoms ***/
		/* generateRandom */
			window.FUNCTION_LIBRARY.generateRandom = generateRandom
			function generateRandom(set, length) {
				set = set || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
				length = length || 32
				
				var output = ""
				for (var i = 0; i < length; i++) {
					output += (set[Math.floor(Math.random() * set.length)])
				}

				return output
			}

		/* sortRandom */
			window.FUNCTION_LIBRARY.sortRandom = sortRandom
			function sortRandom(array) {
				// duplicate array
					var output = duplicateObject(array)

				// fisher-yates shuffle
					var x = output.length
					while (x > 0) {
						var y = Math.floor(Math.random() * x)
						x = x - 1
						var temp = output[x]
						output[x] = output[y]
						output[y] = temp
					}

				return output
			}

})