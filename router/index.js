const express = require('express')
const app = express()
const router=express.Router()
const path=require('path')
const session = require('express-session')
const bodyParser = require('body-parser')
const UserRouter=require('./UserRouter')
const ItemsRouter=require('./ItemsRouter')
const RoomsRouter=require('./RoomsRouter')

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


router.get('/',(req,res)=>{
    // res.send('Ini nanti jadinya Homepage');
    res.render('../views/index.ejs')
})


// Redirect UserRouter
router.use('/user',UserRouter)

// Redirect Items
router.use('/items',ItemsRouter)
// router.use('/items')

//Redirect Rooms
router.use('/rooms',RoomsRouter)

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