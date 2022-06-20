const express = require('express')
const router = express.Router()
const axios = require('axios').default
const cheerio = require('cheerio')

class Recaptcha {
    constructor(host, href, serverId) {
        this.serverId = serverId
        this.host = host; 
        this.watchURL = host + href.replace('/', "/watch-") + `.${serverId}`
        this.client = axios.create({
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0"
            }
        })
    }
    async getRecaptchaKey() {
        let response = (await this.client.get(this.watchURL)).data
        this.RecaptchaKey = new RegExp(/recaptcha_site_key = '(.*?)'/gm).exec(response)[1]
    }

    async getVToken() {
        let info = (await this.client.get(`https://www.google.com/recaptcha/api.js?render=${this.RecaptchaKey}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })).data
        this.vToken = (new RegExp(/releases\/(.*?)\//gm).exec(info)[1])
    }
    
    async getRecaptchaToken() {
        const reloadLink = `https://www.google.com/recaptcha/api2/reload?k=${this.RecaptchaKey}`
        let domain = btoa(`${this.host}:443`).replace(/\n/g, '').replace(/=/g, '.')
        let properLink = `https://www.google.com/recaptcha/api2/anchor?ar=1&k=${this.RecaptchaKey}&co=${domain}&hl=en&v=${this.vToken}&size=invisible&cb=cs3`
        let tokenRequest = (await this.client.get(properLink)).data
        let longToken = cheerio.load(tokenRequest)('#recaptcha-token').attr('value')
        let finalRequest = await this.client.post(reloadLink, `v=${this.vToken}&k=${this.RecaptchaKey}&c=${longToken}&co=${domain}&sa=&reason=q`, {
            headers: { 
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        })
        this.RecaptchaToken = new RegExp(/rresp\","(.+?)\"/gm).exec(finalRequest.data)[1]
    }

    async iframeInfo() {
        let info = await this.client.get(`${this.host}/ajax/get_link/${this.serverId}?_token=${this.RecaptchaToken}`, { 
            headers: { 
                "Referer": this.watchURL
            } 
        })
        let URL = info.data.link // e.x https://mzzcloud.life/embed-4/25kKV67FpxEH?z=
        // console.log(URL)
        let resp =  (await this.client.get(URL, { 
            headers: { 
                "Referer": this.host
            } 
        })).data
        // Setup needed variables for getting sources
        this.RecaptchaNumber = new RegExp(/recaptchaNumber = '(.*?)'/gm).exec(resp)[1],
        this.iframeURL = URL.substring(0, URL.lastIndexOf('/'))
        this.iframeId = URL.substring(URL.lastIndexOf('/') + 1, URL.lastIndexOf('?'))
    }
}

router.get('/:serverId', async (req, res) => {
    try {
        let test = new Recaptcha("https://2kmovie.cc", req.query.href, req.params.serverId)
        // SETUP RECAPTCHA
        await test.getRecaptchaKey()
        await test.getVToken();
        await test.getRecaptchaToken()
        // END
        const properURL = (test.iframeURL.replace('/embed', '/ajax/embed')) + `/getSources?id=${test.iframeId}&_token=${test.RecaptchaToken}&_number=${test.RecaptchaNumber}`
        const result = (await test.client.get(properURL, {
            headers: {
                "Referer": "https://2kmovie.cc/",
                "X-Requested-With": "XMLHttpRequest",
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.5",
                "Connection": "keep-alive",
                "TE": "trailers"
            }
        })).data
        res.json(result)
    } catch (e) {
        console.error(e)
        res.send(e)
    }
})


module.exports = router
// for example = /links/[serverId]?href=[tv-url]
// another one = /links/[serverId]?href=[movie-url]

