const express = require('express')
const app = express()
const db=require('../database')
const session=require('express-session')
const flash=require('req-flash')
const bodyParser=require('body-parser')
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
// After Pre-Config

//Adding Item

const getAllItem=async ()=>{
    await db.query('select * from')
}
const add_item=async (req,res,next)=>{
    const item_name=req.body.item_name
    const item_desc=req.body.item_desc
    const item_bid=req.body.item_bid
    const id_user=req.session.id_user
    await db.query('insert into items(id_user,item_name,item_desc,item_bid,item_status) values(?,?,?,?,?)',[id_user,item_name,item_desc,item_bid,0])
    .then(()=>{
        // req.flash('SuccessAddItem','Barang Anda sudah didaftarkan ke Basis Data.')
        // req.session.Fail.destroy()
        req.session.Success={
            type:'Success',
            message:'Upload Success!'
        }
        res.redirect('/items/add_items')
    }).catch((err)=>{
        res.status(500)
        // req.session.Success.destroy()
        req.session.Fail={
            type:'Fail',
            message:'There is error!'
        }
        res.redirect('/items/add_items')
    })
}

const testing=(req,res,next)=>{
    console.log("TESTING")
}

//After Adding_Item

//SearchForItem
const SearchForItem=(req,res,next)=>{

}


module.exports={
    add_item,
    testing
}