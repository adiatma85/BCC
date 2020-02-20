const express = require('express')
const app = express()
const Router=express.Router()
const bodyParser=require('body-parser')
const path=require('path')
const multer=require('multer')
const countdown=require('countdown')
const RoomsController=require('../controller/RoomsController')

const session=require('express-session')

app.set('view-engine','ejs')
Router.use(express.urlencoded({
    extended:false
}))
Router.use(express.static(path.join(__dirname,'rooms')))

Router.get('/of/:id',RoomsController.getSpecifiedItem,(req,res,next)=>{
    // Fetching Date From Database
    var timing=new Date(
        res.locals.SpecifiedItem.date_year,
        res.locals.SpecifiedItem.date_month,
        res.locals.SpecifiedItem.date_day,
        res.locals.SpecifiedItem.date_hour,
        res.locals.SpecifiedItem.date_minute,
        res.locals.SpecifiedItem.date_second
    )
    // After Fetching Date From Database
    var timer=countdown(null,timing)
    res.render('rooms/e_rooms.ejs',{
        "Item_Detail":res.locals.SpecifiedItem,
        "Timer":timer
    })
})

// De-Activate the Rooms After Trigger
Router.get('/destroy/:id',RoomsController.deActivateRooms,(req,res,next)=>{
    res.redirect('/items/search_for_items')
})

module.exports=Router