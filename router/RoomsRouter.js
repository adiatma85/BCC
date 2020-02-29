const express = require('express')
const app = express()
const Router = express.Router()
const bodyParser = require('body-parser')
const path = require('path')
const multer = require('multer')
const countdown = require('countdown')
const RoomsController = require('../controller/RoomsController')

const session = require('express-session')

app.set('view-engine', 'ejs')
Router.use(express.urlencoded({
    extended: false
}))
// Router.use(express.static(path.join(__dirname,'rooms')))
// Router.use(express.static('./'))
// app.use(express.static('./uploads'))

Router.get('/of/:id', RoomsController.getSpecifiedItem, (req, res, next) => {
    // Fetching Date From Database
    var timing = new Date(
        res.locals.SpecifiedItem.date_year,
        res.locals.SpecifiedItem.date_month,
        res.locals.SpecifiedItem.date_day,
        res.locals.SpecifiedItem.date_hour,
        res.locals.SpecifiedItem.date_minute,
        res.locals.SpecifiedItem.date_second
    )
    // After Fetching Date From Database
    var timer = countdown(null, timing)
    var send_arr={}
    //Object
    var rank={
        // RANKING NAME
        Rank1Name: res.locals.NameRank1[0],
        Rank2Name: res.locals.NameRank2[0],
        Rank3Name: res.locals.NameRank3[0],
        Rank4Name: res.locals.NameRank4[0],
        Rank5Name: res.locals.NameRank5[0],
        // RANKING NAME
        // RANKING BID
        Rank1Bid: res.locals.BidRank1[0],
        Rank2Bid: res.locals.BidRank2[0],
        Rank3Bid: res.locals.BidRank3[0],
        Rank4Bid: res.locals.BidRank4[0],
        Rank5Bid: res.locals.BidRank5[0],
        // RANKING BID
    }
    if (req.session.category) {
        send_arr = {
            "Item_Detail": res.locals.SpecifiedItem,
            "Timer": timer,
            "Image": `../../uploads/item/${res.locals.SpecifiedItem.item_filename}`,
            "Id_user": req.session.id_user,
            "Categorized": req.session.category
        }
    } else {
        send_arr = {
            "Item_Detail": res.locals.SpecifiedItem,
            "Timer": timer,
            "Image": `../../uploads/item/${res.locals.SpecifiedItem.item_filename}`,
            "Id_user": req.session.id_user,
            "Categorized": false
        }
    }
    if (req.session.Message_Bid){
        send_arr.Message_Bid= req.session.Message_Bid
    }
    delete req.session.Message_Bid
    send_arr.RANK = rank
    // console.log(send_arr.RANK)
    // else {
    //     send_arr.Message_Bid= false;
    // }
    res.render('rooms/e_rooms.ejs',send_arr)
})

// De-Activate the Rooms After Trigger
Router.get('/destroy/:id', RoomsController.deActivateRooms, (req, res, next) => {
    res.redirect('/items/search_for_items')
})

// Get Category from Client
Router.post('/category', (req, res, next) => {
    delete req.session.category
    res.redirect(`/rooms/category/${req.body.Category_List}`)
})

// Category Sort
Router.get('/category/:category', RoomsController.filterRoomsCategory, (req, res, next) => {
    res.render('rooms/category_rooms.ejs', {
        Categorized_Items: req.session.category,
        Category_Name: req.params.category
    })
})

//User Bidding
Router.post('/bid',RoomsController.checkCooldown,RoomsController.storeBid)

module.exports = Router