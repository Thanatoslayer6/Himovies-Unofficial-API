const express = require('express')
const router = express.Router()
const axios = require('axios').default.create({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
})
const cheerio = require('cheerio')

const getCheerioData = async (link) => {
    return cheerio.load((await axios.get(link)).data)
}

router.get('/seasons/:tvId', async (req, res) => {
    try {
        let $ = await getCheerioData(`https://2kmovie.cc/ajax/v2/tv/seasons/${req.params.tvId}`)
        let result =  ($('a').map((i, el) => {
            return {
                seasonName: $(el).text().trim() || null,
                seasonId: $(el).attr('data-id') || null,
            }
        })).get()
        res.json(result)
    } catch (e) {
        console.error(e)
        res.send(e)
    }
})

router.get('/episodes/:seasonId', async (req, res) => {
    try {
        let $ = await getCheerioData(`https://2kmovie.cc/ajax/v2/season/episodes/${req.params.seasonId}`)
        let result = ($('.eps-item').map((i, el) => {
            return {
                episodeName: $(el).attr('title') || null,
                episodeId: $(el).attr('data-id') || null,
            }
        })).get()
        res.json(result)
    } catch (e) {
        console.error(e)
        res.send(e)
    }
})

router.get('/servers/:episodeId', async (req, res) => {
    try {
        let $ = await getCheerioData(`https://2kmovie.cc/ajax/v2/episode/servers/${req.params.episodeId}`)
        let result = ($('a').map((i, el) => {
            return {
                server: $(el).find('span').text() || null,
                serverId: $(el).attr('data-id') || null,
                slug: $(el).attr('id') || null,
            }
        })).get()
        res.json(result)
    } catch (e) {
        console.error(e)
        res.send(e)
    }
})

module.exports = router
