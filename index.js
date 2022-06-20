const app = require('express')()
const port = process.env.PORT || 3000

// Root
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

// Search (Movie or Tv-Show)
app.use('/search', require('./routes/search'))

// Get
app.use('/movie', require('./routes/movie'))
app.use('/tv', require('./routes/tv'))

// Get links
app.use('/links', require('./routes/getLinks'))

app.listen(port, () => {
	console.log(`It is listening on http://localhost:${port}`)
})
