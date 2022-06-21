const app = require('express')()
require('dotenv').config()
const PORT = process.env.PORT || 3000
const TIMEOUT = process.env.TIMEOUT || 5000;

// Middleware for timeout
app.use((req, res, next) => {
    // Set the timeout for all HTTP requests
    req.setTimeout(TIMEOUT, () => {
        let err = new Error('Request Timeout');
        err.status = 408;
        next(err);
    });
    // Set the server response timeout for all HTTP requests
    res.setTimeout(TIMEOUT, () => {
        let err = new Error('Cannot process request, server is probably down');
        err.status = 503;
        console.log(err)
        next(err);
    });
    next();
});

// Root
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

// Search (Movie or Tv-Show)
app.use('/search', require('./routes/search'))

// Get
app.use('/movie', require('./routes/movie'))
app.use('/tv', require('./routes/tv'))

// Get links
app.use('/links', require('./routes/getLinks'))

// app.use(timeout(2000))

app.listen(PORT, () => {
	console.log(`It is listening on http://localhost:${PORT}`)
})

    // .setTimeout(2000, () => {
// })
