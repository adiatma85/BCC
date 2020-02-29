const express = require('express')
const app = express()
const db = require('./database')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = 100
const session = require('express-session')
const bodyParser = require('body-parser')
// const io = require('socket.io')(3500)
const router = require('./router')

app.use(session({
    secret: 'ssshhh',
    saveUninitialized: true,
    resave: true
}))

// app.listen(port,()=>{
//     console.log("Listen to",port)
// })

http.listen(port, () => {
    console.log("Listen to", port)
})


// Accessing the Public Data
app.use(express.static('./public'))
// app.use(express.static(__dirname))



app.use(express.json())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))


app.use('/', router)




// IO
io.on('connection', socket => {
    // console.log('User Terkoneksi')
    socket.on('user_bidding', async (data) => {
            var bid_total = parseInt(data.fixed_bid) + parseInt(data.user_bid)
            console.log(data)
            db.query('INSERT INTO rooms (id, id_user, item_bid) values(?,?,?)', [data.item_id, data.user_id, bid_total])
        // socket.emit()
    })
})
//IO end