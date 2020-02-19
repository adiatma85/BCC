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
// After Config

const testing = (req,res,next)=>{
    console.log(req.params.id)
    next()
}

// Get Spesified ITEMS
const getSpecifiedItem= async (req,res,next)=>{
    const [SpecifiedItem]=await db.query('select * from items where id=?',[req.params.id])
    res.locals.SpecifiedItem=SpecifiedItem[0]
    next()
}


module.exports={
    testing,
    getSpecifiedItem
}