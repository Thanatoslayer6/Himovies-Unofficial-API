const app = require('express')()
const port = process.env.PORT || 3000

//root
app.get('/', (req, res) => {
	res.send('<h2>Welcome to the 2kmovie api</h2> <p>Search a tv-show or a movie: /search/tv/[query] or /search/movie/[query] </p> <p> Get seasons: /seasons/[tv-id] </p><p>Get episodes: /episode/[season-id]</p> <p> Get Seasons with episodes: /epandss/[tv-id] #quite slow since it gets all episodes for each season... </p> <p> Get links for tv-shows: /links/tv/?id=[ep-id]&url=[tv-url]</p> <p> Get links for movies: /links/movie/?id=[movie-id]&url=[movie-url]</p>')
})


//SEARCH = get-movie or get-tv
app.use('/search', require('./routes/search'))

//TVSHOWS = get seasons and episodes
app.use('/epandss', require('./routes/get-tv')) //slower option..
app.use('/seasons', require('./routes/get-season'))
app.use('/episodes', require('./routes/get-episode'))

//Get links and subtitles, requires real link from search...
app.use('/links', require('./routes/get-links.js'))


app.listen(port, () => {
	console.log(`It is listening on http://localhost:${port}`)
})
