const express = require('express')
const CryptoJS = require('crypto-js')
const router = express.Router()
const axios = require('axios').default
const cheerio = require('cheerio')
const DOMAIN = process.env.DOMAIN || "https://2kmovie.cc"

class Recaptcha {
    constructor(href, serverId) {
        this.serverId = serverId
        this.watchURL = DOMAIN + href.replace('/', "/watch-") + `.${serverId}`
        this.client = axios.create({
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0"
            }
        })
    }

    async getRecaptchaKey() {
        try {
            let response = (await this.client.get(this.watchURL)).data
            this.RecaptchaKey = new RegExp(/recaptcha_site_key = '(.*?)'/gm).exec(response)[1]
        } catch (e) {
            throw new Error("RecaptchaKey Error")
        }
    }

    async getVToken() {
        try {
            let info = (await this.client.get(`https://www.google.com/recaptcha/api.js?render=${this.RecaptchaKey}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            })).data
            this.vToken = (new RegExp(/releases\/(.*?)\//gm).exec(info)[1])
        } catch (e) {
            throw new Error("VToken Error")
        }
    }
    
    async getRecaptchaToken() {
        try {
            const reloadLink = `https://www.google.com/recaptcha/api2/reload?k=${this.RecaptchaKey}`
            let properDomain = btoa(`${DOMAIN}:443`).replace(/\n/g, '').replace(/=/g, '.')
            let properLink = `https://www.google.com/recaptcha/api2/anchor?ar=1&k=${this.RecaptchaKey}&co=${properDomain}&hl=en&v=${this.vToken}&size=invisible&cb=cs3`
            let tokenRequest = (await this.client.get(properLink)).data
            let longToken = cheerio.load(tokenRequest)('#recaptcha-token').attr('value')
            let finalRequest = await this.client.post(reloadLink, `v=${this.vToken}&k=${this.RecaptchaKey}&c=${longToken}&co=${properDomain}&sa=&reason=q`, {
                headers: { 
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            })
            this.RecaptchaToken = new RegExp(/rresp\","(.+?)\"/gm).exec(finalRequest.data)[1]
        } catch (e) {
            throw new Error("RecaptchaToken Error")
        }
    }

    async iframeInfo() {
        try {
            // let info = await this.client.get(`${DOMAIN}/ajax/get_link/${this.serverId}?_token=${this.RecaptchaToken}`, { 
            //     headers: { 
            //         "Referer": this.watchURL
            //     } 
            // })
            let info = await this.client.get(`${DOMAIN}/ajax/sources/${this.serverId}`, { 
                headers: { 
                    "Referer": this.watchURL
                } 
            })
            let URL = info.data.link // e.x https://mzzcloud.life/embed-4/25kKV67FpxEH?z=
            // let resp =  (await this.client.get(URL, { 
            //     headers: { 
            //         "Referer": DOMAIN
            //     } 
            // })).data
            // Setup needed variables for getting sources
            // this.RecaptchaNumber = new RegExp(/recaptchaNumber = '(.*?)'/gm).exec(resp)[1],
            this.iframeURL = URL.substring(0, URL.lastIndexOf('/'))
            this.iframeId = URL.substring(URL.lastIndexOf('/') + 1, URL.lastIndexOf('?'))
        } catch (e) {
            throw new Error("iframeInfo Error")
        }
    }
}

// Added this method to decrypt sources
const decryptSource = async (encryptedSource) => {
    // There are 2 keys possible, just try them all
    try { // Dokicloud
        let decryptionKey = (await axios.get('https://raw.githubusercontent.com/consumet/rapidclown/dokicloud/key.txt')).data
        let bytes = CryptoJS.AES.decrypt(encryptedSource, decryptionKey);
        return (JSON.parse(bytes.toString(CryptoJS.enc.Utf8)));
    } catch(e) {
        console.log("Dokicloud key failed to decrypt source")
    }
    try { // Rabbitstream
        let decryptionKey = (await axios.get('https://raw.githubusercontent.com/consumet/rapidclown/rabbitstream/key.txt')).data
        let bytes = CryptoJS.AES.decrypt(encryptedSource, decryptionKey);
        return (JSON.parse(bytes.toString(CryptoJS.enc.Utf8)));
    } catch (e) {
        console.log("Rabbitstream key failed to decrypt source")
    }
}

router.get('/:serverId', async (req, res) => {
    try {
        if (req.query.href == undefined || req.query.href == '') {
            return res.status(400).json({ message: "Missing href parameter", status: 400 })
        }
        let test = new Recaptcha(req.query.href, req.params.serverId)
        // SETUP RECAPTCHA AND NEEDED VARIABLES
        // await test.getRecaptchaKey()
        // await test.getVToken();
        // await test.getRecaptchaToken()
        await test.iframeInfo();
        // END
        // const properURL = (test.iframeURL.replace('/embed', '/ajax/embed')) + `/getSources?id=${test.iframeId}&_token=${test.RecaptchaToken}&_number=${test.RecaptchaNumber}`
        const properURL = (test.iframeURL.replace('/embed', '/ajax/embed')) + `/getSources?id=${test.iframeId}`
        const result = (await test.client.get(properURL, {
            headers: {
                "Referer": DOMAIN,
                "X-Requested-With": "XMLHttpRequest",
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.5",
                "Connection": "keep-alive",
                "TE": "trailers"
            }
        })).data
        // Assign the decrypted data into the original result
        result.sources = await decryptSource(result.sources)
        res.json(result)
    } catch (e) {
        res.send(e)
        throw Error(e)
    }
})


module.exports = router
// for example = /links/[serverId]?href=[tv-url]
// another one = /links/[serverId]?href=[movie-url]
// can decrypt content from api please change key 
