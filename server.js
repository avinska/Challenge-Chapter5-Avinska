if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

//importing modules
const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const { v4:uuid } = require('uuid')
// const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const isLoggedIn = require('./middleware/authMiddleware')

app.use(cookieParser())
app.set('view engine', 'ejs')
app.set('views', './views');
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

// app.use(methodOverride('_method'))
app.use(express.json())

// setting route for main page
app.get('/', (req,res) => {
	res.render('index.ejs', {name: 'req.user.username'})
})

// setting route for register
app.get('/register', (req, res) => {
	res.render('register')
})

app.post('/register', async (req, res) => {
	const users = JSON.parse(fs.readFileSync('./data/user.json', 'utf-8'))
	try {
		const hashedPass = await bcrypt.hash(req.body.password, 10)
		users.push({
			id: uuid(),
			username: req.body.username,
			email: req.body.email,
			password: hashedPass
		})
		fs.writeFileSync('./data/user.json', JSON.stringify(users, null, 4))
		res.redirect('/login')
	} catch {
		res.redirect('/')
	}
	console.log(users)
})
	  

// setting route for login page
app.get('/login', (req, res) => {
	const { status } = req.query
  res.render('login', {
    status
  })
})

app.post('/login', async (req, res) => {
	const { username, email, password } = req.body
	const data = JSON.parse(fs.readFileSync('./data/user.json', 'utf-8'))
	const userMatch = data.find((item) => item.username == username)
  
	if (!userMatch) {
	  res.redirect('/login?status=emailnotfound')
	} else {
	  if (await bcrypt.compare(password, userMatch.password)) {
		const token = jwt.sign({ 
		  username: userMatch.username,
		  id: userMatch.id
		}, '5ec12eT', {
		  expiresIn: 86400
		})
  
		res.cookie('jwt', token, { maxAge: 86400000 })
		res.redirect('/game')
	  } else {
		res.redirect('/login?status=incorrectpassword')
	  }
	}
  })

//  setting game route
app.get('/game', isLoggedIn, (req, res) => {
	res.render('suit')
})

app.post('/logout', (req, res) => {
	res.cookie('jwt', '', { maxAge: 5000})
	res.redirect('/login')
})

// setting up port
const PORT = 3000;

app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`)
})

