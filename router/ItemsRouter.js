const express = require('express')
const app = express()
const Router=express.Router()
const bodyParser=require('body-parser')
const path=require('path')
const multer=require('multer')
const ItemsController=require('../controller/ItemsController')

const session=require('express-session')

// Pre-CONFIG
app.use(session({
    secret:'ssshhh',
    saveUninitialized: true,
    resave:true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}))
app.use(express.static(__dirname+'/views'))
var sess;
// After Pre-Config


app.set('view-engine','ejs')
Router.use(express.urlencoded({
    extended:false
}))
// Router.use(express.static(path.join(__dirname,'items')))

// const upload = multer({
//     dest:'public/uploads/item'
// })

var id

//Get AllItem
Router.get('/search_for_items',ItemsController.expiredCheck,ItemsController.getAllItem,(req,res,next)=>{
    // console.log(res.locals.Items)
    res.render('items/rooms.ejs',{
        "Items_List":res.locals.Items
    })
})

// Adding Item
Router.get('/add_items',(req,res,next)=>{
    if(req.session.Success){
        res.render('items/adding_items.ejs',{
            "usr":req.session.usr,
            "Success":req.session.Success
        })
    } else if(req.session.Fail){
        res.render('items/adding_items.ejs',{
            "usr":req.session.usr,
            "Failed":req.session.Fail
        })
    } else{
        res.render('items/adding_items.ejs',{
            "usr":req.session.usr,
            "Success":false,
            "Failed":false
        })
    }
})
//Post Adding Item
Router.post('/add_items',(req,res,next)=>{
    delete req.session.Success
    delete req.session.Fail
    delete req.session.Item
    next()
},ItemsController.Uploading,ItemsController.add_item)

//Search For Items
// Router.get('/search_for_items',(req,res,next)={

// })

module.exports=Router