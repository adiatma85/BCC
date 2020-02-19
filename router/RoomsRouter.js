const express = require('express')
const app = express()
const Router=express.Router()
const bodyParser=require('body-parser')
const path=require('path')
const multer=require('multer')
const RoomsController=require('../controller/RoomsController')

const session=require('express-session')

app.set('view-engine','ejs')
Router.use(express.urlencoded({
    extended:false
}))
Router.use(express.static(path.join(__dirname,'rooms')))

Router.get('/of/:id',RoomsController.getSpecifiedItem,(req,res,next)=>{
    // console.log('Connected')
    // console.log(req.params.id)
    res.render('rooms/e_rooms.ejs',{
        "Item_Detail":res.locals.SpecifiedItem
    })
})

module.exports=Router