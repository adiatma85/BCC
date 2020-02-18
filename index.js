const express=require('express')
const app=express()
const port=100
const session = require('express-session')
const bodyParser = require('body-parser')
const router=require('./router')

app.use(session({
    secret:'ssshhh',
    saveUninitialized: true,
    resave:true
}))

app.listen(port,()=>{
    console.log("Listen to",port)
})



app.use(express.json())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}))

app.use('/',router)