const express = require('express')
const app = express()
const db=require('../database')
const bcrypt=require('bcryptjs')
const session=require('express-session')
const bodyParser=require('body-parser')
const url=require('url')

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

const get_user= async(req,res,next)=>{
    const [check]=await db.query('select * from users where id=?',[sess])
    console.log(sess)
    // usr=check[0].username
    res.redirect(url.format({
        "id":sess,
        // "usr":usr,
        pathname: 'user/logged'
    }))
}

const register_user = async(req,res,next)=>{
    // console.log('Tested')
    const name=req.body.name
    // const username=req.body.username
    // const NIK=req.body.NIK
    // const usrname=req.body.usrname
    const email=req.body.email
    // const [check]=await db.query('select * from users where email=? AND username=? AND email=? limit 1',[email,usrname,email])
    
    const [check]=await db.query('select * from users where NIK=? AND username=? limit 1',[name,email])
    
    if(check.length==0){
        const password=req.body.password
        const hashedpassword=await bcrypt.hashSync(password,11)
        db.query('insert into users(NIK,password,username) values(?,?,?)',[name,hashedpassword,email])
        req.session.Registered={
            type:'Success',
            message: 'Welcome to Auxtion'
        }

    } else {
        req.session.Registered={
            type:'Fail',
            message: 'You are already registered!' 
        }
        
        // res.status(409)
        // const error=new Error("Email has already registered")
        // next(error)
    }
    res.redirect('/user/register')
    // console.log('test')
}

const login_user = async(req, res, next)=>{
    console.log('In Login_User')
    // const UsrnameOrEmail=req.body.username
    const username=req.body.username
    const user_password=req.body.password
    // const [check]=await db.query('select * from users where email=? OR username=? limit 1',[UsrnameOrEmail,UsrnameOrEmail])
    // const [check]=await db.query('select * from users where email=?',[email])
    // try {
        const [check]=await db.query('select * from users where username=?',[username])
        const db_password=check[0].password
        const true_pass=bcrypt.compareSync(user_password,db_password)
            if (check.length !=0 && true_pass){
                // Session Data Making
                const db_id_user=check[0].id
                // sess=req.session.id
                sess=db_id_user
                usr=check[0].username
                req.session.usr=usr
                req.session.id_user=db_id_user
                res.redirect('/user/logged')
                // return res.redirect('/logged')
            } else {
                req.session.Wrong={
                    type:'Fail',
                    message: 'Username or Password is wrong!'
                }
                res.redirect('/user/login')
            }
    // } catch (error) {
    //     var err=new Error('Error')
    //     res.json({
    //         "message":err
    //     })
    //     next(err)
    // }
    
}
const logged_user = (req,res,next)=>{
    // console.log(req.session.id)
    if(req.session.id){
        // console.log("IYESH kamu nomor")
        // console.log(sess)
        next()
    } else{
        return res.redirect('/user/login')
    }
}

const up_profiler = (req,res,next)=>{
    const Bio=req.body.biography
    // const A
}

const log_out= (req,res,next)=>{
        req.session.destroy((err)=>{
            if (err){
                return console.log(err)
            }
            res.redirect('/')
        })
}

const authenticated=(req,res,next)=>{
    if (req.session.id_user){
        next()
    } else{
        res.redirect('/user/login')
    }
}


module.exports={
    register_user,
    login_user,
    logged_user,
    log_out,
    get_user,
    authenticated
}