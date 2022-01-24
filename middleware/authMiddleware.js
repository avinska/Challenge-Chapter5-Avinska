const jwt = require('jsonwebtoken')

const isLoggedIn = (req, res, next) => {
	const token = req.cookies.jwt

	if (token) {
		jwt.verify(token, '5ec12eT', (err, decodedToken) => {
			if (err) {
				res.locals.user = null
				res.redirect('/login')
			} else {
				res.locals.user = decodedToken.username
				console.log(decodedToken)
				next()
			}
		})
	} else {
		res.locals.user = null
		res.redirect('/login')
	}

}


module.exports = isLoggedIn;