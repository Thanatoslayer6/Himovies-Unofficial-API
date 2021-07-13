const axios = require('axios').default
const cheerio = require('cheerio')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
	res.send('<h3>Get seasons and episodes manually...</h3><p>/seasons/[tv-id] </p><p>/episodes/[season-id]</p>')
})

router.get('/:query', async(req, res) => {
	try {
		let resp = await axios.get(`https://2kmovie.cc/ajax/v2/tv/seasons/${req.params.query}`)
		let $ = cheerio.load(resp.data)
		let data = []
		$('.dropdown-menu a').each((i,el) => {
			data.push({
				season: $(el).text(),
				id: $(el).attr('data-id'),
				index: i
			})
		})
		res.json(data)	
	} catch (e) {
		console.log(`Error: ${e}`)
		res.send(`Error: ${e}`)
	}
})

module.exports = router

