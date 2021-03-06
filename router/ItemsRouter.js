const express = require('express')
const app = express()
const Router=express.Router()
const bodyParser=require('body-parser')
const path=require('path')
const ItemsController=require('../controller/ItemsController')

const session=require('express-session')

app.set('view-engine','ejs')
Router.use(express.urlencoded({
    extended:false
}))
Router.use(express.static(path.join(__dirname,'items')))

var id

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
},ItemsController.add_item)

//Search For Items
Router.get('/search_for_items')

module.exports=Router