const express = require('express')
const router = express.Router()
const axios = require('axios').default.create({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
})
const cheerio = require('cheerio')
const DOMAIN = process.env.DOMAIN || "https://2kmovie.cc"

router.get('/servers/:movieId', async(req, res) => {
    try {
        let url = `${DOMAIN}/ajax/movie/episodes/${req.params.movieId}`;
        let response = (await axios.get(url)).data;
        let $ = cheerio.load(response);
        let result = ($('a').map((i, el) => {
            return {
                server: $(el).find('span').text() || null,
                serverId: $(el).attr('data-linkid') || $(el).attr('data-id'),
                slug: $(el).attr('id') || null,
            }
        })).get()
        res.json(result)
    } catch (e) {
        res.send(e)
        throw Error(e)
    }
})

module.exports = router
