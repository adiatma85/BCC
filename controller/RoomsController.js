const express = require('express')
const app = express()
const db=require('../database')
const session=require('express-session')
const flash=require('req-flash')
const bodyParser=require('body-parser')
const countdown = require('countdown')
const url=require('url')

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
// After Config

const testing = (req,res,next)=>{
    console.log(req.params.id)
    next()
}

// Get Spesified ITEMS
const getSpecifiedItem= async (req,res,next)=>{
    const [SpecifiedItem]=await db.query('select * from items where id=?',[req.params.id])
    res.locals.SpecifiedItem=SpecifiedItem[0]
    req.session.SpecifiedItem=res.locals.SpecifiedItem
    // GET EACH RANK ID to NAME
    res.locals.NameRank1=await db.query('SELECT username FROM users WHERE id=?',[SpecifiedItem[0].id_rank1])
    res.locals.NameRank2=await db.query('SELECT username FROM users WHERE id=?',[SpecifiedItem[0].id_rank2])
    res.locals.NameRank3=await db.query('SELECT username FROM users WHERE id=?',[SpecifiedItem[0].id_rank3])
    res.locals.NameRank4=await db.query('SELECT username FROM users WHERE id=?',[SpecifiedItem[0].id_rank4])
    res.locals.NameRank5=await db.query('SELECT username FROM users WHERE id=?',[SpecifiedItem[0].id_rank5])
    // console.log(res.locals.NameRank5[0][0].username)
    // console.log(res.locals.NameRank5[0].length) Checking if it is exist or not
    // After GET EACH NAME
    // GET EACH BID
    res.locals.BidRank1=await db.query('SELECT item_bid FROM rooms WHERE id_user=?',[SpecifiedItem[0].id_rank1])
    res.locals.BidRank2=await db.query('SELECT item_bid FROM rooms WHERE id_user=?',[SpecifiedItem[0].id_rank2])
    res.locals.BidRank3=await db.query('SELECT item_bid FROM rooms WHERE id_user=?',[SpecifiedItem[0].id_rank3])
    res.locals.BidRank4=await db.query('SELECT item_bid FROM rooms WHERE id_user=?',[SpecifiedItem[0].id_rank4])
    res.locals.BidRank5=await db.query('SELECT item_bid FROM rooms WHERE id_user=?',[SpecifiedItem[0].id_rank5])
    // console.log(res.locals.BidRank5[0].length) Checking if it is exist or not
    // AFTER GET EACH BID
    // :v
    next()
}

// De-Activate Rooms
const deActivateRooms = async (req,res,next)=>{
    db.query('UPDATE items SET item_status=? WHERE id=?',[1,req.params.id])
}

// GET Categorized Filter
const filterRoomsCategory = async (req,res,next)=>{
    delete req.session.category
    const [get_Category]=await db.query('SELECT * from items WHERE item_category=? AND item_status=?',[req.params.category,0])
    req.session.category=get_Category
    req.session.category.Kategori=req.params.category
    next()
}

// Storing Bid and Delete the previous one if it's from the same id
const storeBid = async (req,res,next)=>{
    // Storing Bid forEach
    const detail_item=req.session.SpecifiedItem
    const fixed_bid=parseInt(detail_item.item_bid)
    const user_bid=req.body.user_bid
    const bid_user=parseInt(user_bid)
    const total=fixed_bid + bid_user
    // Delete the Previous same id in same rooms
    await db.query('DELETE FROM rooms WHERE id=? AND id_user=?',[detail_item.id,req.session.id_user])
    // And store the biggest one
    await db.query('INSERT INTO rooms (id, id_user, item_bid) values(?,?,?)',[detail_item.id, req.session.id_user, total])
    // After Storing
    // Checking Rank
    const [check_rank] = await db.query('SELECT * from items WHERE id=?',[detail_item.id])
    // console.log(check_rank)
    const id_1 = check_rank[0].id_rank1
    const id_2 = check_rank[0].id_rank2
    const id_3 = check_rank[0].id_rank3
    const id_4 = check_rank[0].id_rank4
    if (id_1===0){
        await db.query('UPDATE items SET id_rank1=?, item_bid=? WHERE id=?',[req.session.id_user, total ,detail_item.id])
    } else {
        await db.query('UPDATE items SET id_rank1=?, id_rank2=?, id_rank3=?, id_rank4=?, id_rank5=?, item_bid=? WHERE id=?',[req.session.id_user, id_1, id_2, id_3, id_4, total, detail_item.id])
    }
    
    // Pre-Adding Cooldown
    const date_now=new Date()
    const obj_date={
        "Year":date_now.getFullYear(),
        "Month":date_now.getMonth(),
        "Date":date_now.getDate(),
        "Hours":date_now.getHours(),
        "Minutes":date_now.getMinutes(),
        "Seconds":date_now.getSeconds()
    }
    const dead_minutes=obj_date.Minutes + 30
    await db.query('INSERT into cooldowns(user_id, date_year, date_month, date_day, date_hours, date_minute, date_seconds) values(?,?,?,?,?,?,?)',[req.session.id_user, obj_date.Year, obj_date.Month, obj_date.Date, obj_date.Hours, dead_minutes, obj_date.Seconds])
    // Added Cooldown
    
    req.session.Message_Bid = "Anda telah melakukan Bid! Tunggu selama 30 menit lagi untuk cooldown!"

    res.redirect(`/rooms/of/${detail_item.id}`)
}

//Checking the User is Still Cooldown or Not
const checkCooldown = async (req,res,next)=>{
    const [data_cooldown] = await db.query('SELECT * FROM cooldowns WHERE user_id=?',[req.session.id_user])
    if (data_cooldown.length === 0) {
        // console.log('TEST')
        next()
    } else {
        // console.log(data_cooldown)
        // console.log(data_cooldown.date_year)
        const dead_time=new Date(
            data_cooldown[0].date_year,
            data_cooldown[0].date_month,
            data_cooldown[0].date_day,
            data_cooldown[0].date_hours,
            data_cooldown[0].date_minute,
            data_cooldown[0].date_seconds
        )
        // console.log(dead_time)
        var value=countdown(null,dead_time)
        if(value.value <= 0){ 
            // After Cooldown Expired
            await db.query('DELETE FROM cooldowns WHERE user_id=?',[req.session.id_user])
            next()
        } else {
            req.session.Message_Bid = "Anda Masih dalam Tahap Cooldown! Tunggu dalam " + value.minutes + " menit lagi"
            return res.redirect(`/rooms/of/${req.session.SpecifiedItem.id}`)
        }
    }
}


module.exports={
    testing,
    getSpecifiedItem,
    deActivateRooms,
    filterRoomsCategory,
    storeBid,
    checkCooldown
}