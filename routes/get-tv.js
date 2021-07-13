const express = require('express')
const router = express.Router()

const axios = require('axios').default
const cheerio = require('cheerio')

router.get('/', (req, res) => {

})


router.get('/:id', async(req, res) => {
	try {
		let resp = await axios.get(`https://2kmovie.cc/ajax/v2/tv/seasons/${req.params.id}`)
		let $ = cheerio.load(resp.data)
		let data = []
		$('.dropdown-menu a').each((i,el) => {
			data.push({
				season_num: $(el).text(),
				id: $(el).attr('data-id'),
				index: i
			})
		})
		for (let i = 0; i < data.length; i++) {
			let eps = await get_episode(data[i].id)
			data[i].episodes = eps
		}
		res.json(data)
	} catch (e) {
		console.log(`Error: ${e}`)
		res.send(`Error: ${e}`)
	}
})


let get_episode = async(id) => {
	try {
		let resp = await axios.get(`https://2kmovie.cc/ajax/v2/season/episodes/${id}`)	
		let $ = cheerio.load(resp.data)
		let data = []
		$('.nav-item a').each((i,el) => {
			data.push({
				ep_title: $(el).attr('title'),
				id: $(el).attr('data-id'),
				type: 'tv',
				index: i
			})
		})
		return data;
	} catch (e) {
		 console.log(`Error ${e}`)
	}
}

module.exports = router
