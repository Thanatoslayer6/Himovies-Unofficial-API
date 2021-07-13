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
			await page.goto(real)	
			
			const subs = await page.waitForRequest((req) => {
				return req.url().endsWith(`.vtt`)
			})

			const vidlink = await page.waitForRequest((req) => {
				return req.url().endsWith(`.mp4`)
			})

			await browser.close()
			res.json({ link: vidlink.url(), subtitle: subs.url() })
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
			await page.goto(real)	

			const subs = await page.waitForRequest((req) => {
				return req.url().endsWith(`.vtt`)
			})

			const vidlink = await page.waitForRequest((req) => {
					return req.url().endsWith('.mp4')
			})

			await browser.close()
			res.json({ link: vidlink.url(), subtitle: subs.url() })

	} catch(e) {
		console.log(`Error: ${e}`)
		res.send(`Error: ${e}`)
	}
})

module.exports = router
// for example = /links/tv?id=[episode-id]&url=[tv-url]
// another one = /links/movie?id=[movie-id]&url=[movie-url]

