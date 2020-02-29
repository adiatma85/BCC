require('dotenv').config()

const express = require('express')
const app = express()
const router=express.Router()
const path=require('path')
const session = require('express-session')
const bodyParser = require('body-parser')
const http = require('http').createServer(app)
const io_1 = require('socket.io')(http)
const UserRouter=require('./UserRouter')
const ItemsRouter=require('./ItemsRouter')
const RoomsRouter=require('./RoomsRouter')

// Is the User Authenticated?
const is_auth=require('../controller/UserController')
//

// Get All the Data Required
const data = require('../controller/ItemsController')
//


app.set('view-engine','ejs')
// router.use(express.urlencoded({extended:false}))
// router.use(express.static(path.join(__dirname,'user')))

app.use(session({
    secret:'ssshhh',
    saveUninitialized: true,
    resave:true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}))


io_1.on('connection', socket => {
    console.log('Mencoba')
    socket.on('message',data => {
        console.log(data)
    })
})

router.get('/',data.getAllItem,(req,res)=>{
    // res.send('Ini nanti jadinya Homepage');
    res.render('../views/index.ejs',{
        item: res.locals.Items
    })
})


// Redirect UserRouter
router.use('/user',UserRouter)
// router.use('user')

// Redirect Items
router.use('/items',is_auth.authenticated,ItemsRouter)
// router.use('/items')

//Redirect Rooms
router.use('/rooms',is_auth.authenticated,RoomsRouter)

// Error Handler
router.use(notFound)
router.use(errorHandler)


function notFound(req, res,next){
    res.status(404)
    const err=new Error("Page not found")
    next(err)
}

function errorHandler(err, req, res,next){
    res.status(res.statucCode || 500)
    const message=err.message || "Internal server error"
    res.json({
        "message": message
    })
}


module.exports=router