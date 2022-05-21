const express       = require("express")
const app           = express()

const bodyParser    = require("body-parser")
const cookieParser  = require("cookie-parser")

const fetch         = require('node-fetch')

const PORT          = process.env.PORT || 8080

app.listen(PORT, console.log('[EXPRESS] Proxy server is now running on port ' + PORT))

app.use(bodyParser.raw())
app.use(cookieParser())
app.all('/*', async (req, res) => {
    const target = req.query.target || req.headers['x-target'] || req.cookies.target
    const method = req.query.method || req.method
    res.cookie('target', target)

    if (!target) {
        res.status(400)
        res.send({ 'error-message': 'No provided target or method' })
        return
    } else if (target.includes("proxifi.ga")) {
        res.status(400)
        res.send({ 'error-message': 'Did you realy think that was a good idea, you realy think that you are smart huh!'})
    }

    const path   = req.originalUrl
    const header = fHeader(req.headers)
    const body = (method.toLowerCase() == 'get') ? null : req.body 
    
    try {
        const response = await fetch(target + path, {
            method,
            header,
            body
        })
        
        
        Object.keys(response.headers).forEach((value) => {
            res.setHeader(value, response.headers.get(value))
        })
        
        response.body.pipe(res)
        response.body.on('end', () => res.end())
    } catch (err) {
        res.status(500)
        res.send(err)
        //console.error(err)
    }
})

function fHeader(headers) {
    const obj = {}
    const keys = Object.keys(headers)
    keys.forEach((value) => {
        if (value.startsWith('x-p-')) {
            obj[value.slice(4)] = headers[value]
        }
    })
    return obj
}