## What is HiMovies?

HiMovies is a free and online streaming website for Movies and Tv-Shows. It offers a wide range of hosts or sites if you may, but all of these sites are built upon the same template of some sort. Hence, the reason why there are so many. 

__Check out the clones/mirrors here__
- [HiMovies Clones/Mirrors](https://www.reddit.com/r/freemediaheckyeah/wiki/storage#wiki_himovies_clones)

This Rest API is made possibly by using simple scraping tools and a little bit of copying and some research from other people's source code. Take note that if HiMovies and its clones decided to update or even upgrade their website, this API might fail and perhaps it might take a while for me to fix it 🛠️

Luckily with all of its mirrors and clones, you can choose a specific instance that you like 👍

## Setting it up

**Requirements**
* [NodeJS](https://nodejs.org/en/) at least >= 13.x.x

_Step 1:_ Clone the repository
```bash
git clone https://github.com/Thanatoslayer6/Himovies-Unofficial-API.git
```

_Step 2:_ Install the dependencies
```bash
cd Himovies-Unofficial-API && npm install
```
_Step 3:_ Setup the .env file **(OPTIONAL)**

_Create a .env file at the project's root_
```bash
# Example .env file

# The port where you want your API to run
# Default: 3000
PORT=2000

# The domain you want to scrape, notice theres no slash at the end of the URL
# Default: "https://2kmovie.cc"
DOMAIN="https://dopebox.to"

# The timeout per http request
# Default: 5000
TIMEOUT=10000
```

_Step 4:_ Enjoy and run 😎
```bash
npm run start
# Or you can just run the file instead
node index.js
```

## Endpoints

__Searching__

* Search for a Tv-Show or Movie: 
`GET: /search/[query]`

__Movies__
* Movie Servers: 
`GET: /movie/servers/[movieId]`

 __Tv-Show__
* TV Seasons: `GET: /tv/seasons/[tvId]`
* TV Episodes: `GET: /tv/episodes/[seasonId]`
* TV Episode Servers: `GET: /tv/servers/[episodeId]`

 __Links__
* TV Episode or Movie: 
`GET: /links/[serverId]?href=[episodeId or movieId]`

### Special Thanks to 🤟
* [LagradOst/CloudStream-3](https://github.com/LagradOst/CloudStream-3)
* [saikou-app/saikou](https://github.com/saikou-app/saikou)
