const express = require('express')
const router = express.Router()
const axios = require('axios').default.create({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
})
const cheerio = require('cheerio')

router.get('/', (req, res) => {
	res.send('<h3>Search instructions...</h3><p>TV-SHOWS - /search/tv/[query]</p><p>MOVIES - /search/movie/[query]</p>')
})

router.get('/:query', async(req, res) => {
    try {
        let url = `https://2kmovie.cc/search/${req.params.query.replace(/\s/g,'-')}`
        let response = (await axios.get(url)).data;
        let $ = cheerio.load(response);
        let result = ($('.film-detail').map((i, el) => {
            if ($(el).find('.film-name a').attr('href').startsWith('/movie/')) {
                return {
                    title: $(el).find('.film-name a').attr('title'),
                    type: "movie",
                    href: $(el).find('.film-name a').attr('href'),
                    id: $(el).find('.film-name a').attr('href').split('-').pop(),
                    info: $(el).find('.fd-infor').text()
                }
            } else {
                return {
                    title: $(el).find('.film-name a').attr('title'),
                    type: "tv",
                    href: $(el).find('.film-name a').attr('href'),
                    id: $(el).find('.film-name a').attr('href').split('-').pop(),
                    info: $(el).find('.fd-infor').text()
                }
            }
        })).get()
        res.json(result)
    } catch(e) {
        console.error(e)
        res.send(e)
    }
})

module.exports = router
