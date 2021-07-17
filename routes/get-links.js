const express = require('express')
const router = express.Router()
const axios = require('axios').default
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')

router.get('/tv', async(req, res) => {
	try {
		 	let resp = await axios.get(`https://2kmovie.cc/ajax/v2/episode/servers/${req.query.id}`)	
			let $ = cheerio.load(resp.data)
			let sid = $('.nav-item a').attr('data-id') //chooses vidcloud server id...
			let real = `https://2kmovie.cc${req.query.url.replace(/\/tv\//, '/watch-tv/')}.${sid}`
			//use puppeteer and listen for media requests
			const browser = await puppeteer.launch({
				headless: true,
				args: [`--no-sandbox`]
			})
			const page = (await browser.pages())[0];
			await page.goto(real, { waitUntil: 'networkidle0' })	

			//scrape
			const iframe = await page.waitForSelector('#iframe-embed');
			const contframe = await iframe.contentFrame();
			const script = await contframe.waitForSelector('body > script');
			const script_text = await script.evaluateHandle(el => {
				return el.textContent;
			})

			//now we match the needed links using regex...	
			const data = script_text._remoteObject.value.match(/\{".*?\"}/gm)
			const items = [];
			
			//push data inside that stuff...
			for (let v in data) {
				items.push(JSON.parse(data[v]))
			}
			
			//destructure for convenience...
			const [source_1, source_2, ...subs] = items;

			await browser.close()

			res.json({
				links: [source_1, source_2],
				subtitles: subs
			})

	} catch(e) {
		console.log(`Error: ${e}`)	
		res.send(`Error: ${e}`)
	}
})
	
router.get('/movie/', async(req, res) => {
	try {
			let resp = await axios.get(`https://2kmovie.cc/ajax/movie/episodes/${req.query.id}`)
			let $ = cheerio.load(resp.data)
			let sid = $('.nav-item a').attr('data-linkid') //chooses vidcloud server id...
			let real = `https://2kmovie.cc${req.query.url.replace(/\/movie\//, '/watch-movie/')}.${sid}`
			//use puppeteer and listen for media requests
			const browser = await puppeteer.launch({
				headless: true, 
				args: [`--no-sandbox`]
			})
			const page = (await browser.pages())[0];
			await page.goto(real, { waitUntil: 'networkidle0' })	

			//scrape
			const iframe = await page.waitForSelector('#iframe-embed');
			const contframe = await iframe.contentFrame();
			const script = await contframe.waitForSelector('body > script');
			const script_text = await script.evaluateHandle(el => {
				return el.textContent;
			})

			//now we match the needed links using regex...	
			const data = script_text._remoteObject.value.match(/\{".*?\"}/gm)
			const items = [];
			
			//push data inside that stuff...
			for (let v in data) {
				items.push(JSON.parse(data[v]))
			}
			
			//destructure for convenience...
			const [source_1, source_2, ...subs] = items;

			await browser.close()

			res.json({
				links: [source_1, source_2],
				subtitles: subs
			})

	} catch(e) {
		console.log(`Error: ${e}`)
		res.send(`Error: ${e}`)
	}
})

module.exports = router
// for example = /links/tv?id=[episode-id]&url=[tv-url]
// another one = /links/movie?id=[movie-id]&url=[movie-url]

