const express = require('express')
const router = express.Router()
const axios = require('axios').default
const cheerio = require('cheerio')

router.get('/', (req, res) => {
	res.send('<h3>Search instructions...</h3><p>TV-SHOWS - /search/tv/[query]</p><p>MOVIES - /search/movie/[query]</p>')
})

//FOR TV-SHOWS
router.get('/tv/:query', async(req, res) => {
	try {
		let proper = req.params.query.replace(/\s/gm, '-')
		let resp = await axios.get(`https://2kmovie.cc/search/${proper}`)	
		let $ = cheerio.load(resp.data)
		let data = [];
		$('.film-poster-ahref.flw-item-tip').each((i, el) => {
			data.push({
			title: $(el).attr('title'),
			link: $(el).attr('href'),
			type: $(el).attr('href').split('/')[1],
			id: $(el).attr('href').split('-').pop(),
		})
	})
		//filter array then return tv-shows
		data = data.filter(stuff => {
			return stuff.type !== 'movie'
		})	
		
		res.json(data)

} catch (e) {
	console.log(`Error: ${e}`)
	res.send(`Error: ${e}`)
	}
})
//FOR MOVIES
router.get('/movie/:query', async(req, res) => {
	try {
		let proper = req.params.query.replace(/\s/gm, '-')
		let resp = await axios.get(`https://2kmovie.cc/search/${proper}`)	
		let $ = cheerio.load(resp.data)
		let data = [];
		$('.film-poster-ahref.flw-item-tip').each((i, el) => {
			data.push({
			title: $(el).attr('title'),
			link: $(el).attr('href'),
			type: $(el).attr('href').split('/')[1],
			id: $(el).attr('href').split('-').pop(),
		})
	})
		//filter array and return only movies...
		data = data.filter(stuff => { 
			return stuff.type !== 'tv'
		})	

		res.json(data)

} catch (e) {
	console.log(`Error: ${e}`)
	res.send(`Error: ${e}`)
	}
})

module.exports = router
