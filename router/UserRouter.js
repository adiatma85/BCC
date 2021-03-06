
const express = require('express')
const app = express()
const Router=express.Router()
const bodyParser=require('body-parser')
const path=require('path')
const UserController=require('../controller/UserController')
const session=require('express-session')
// const methodOverride = require('method-override')

// SESSION
app.set('trust proxy',1)
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie:{secure:true}
}))
// SESSION
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}))

app.set('view-engine','ejs')
Router.use(express.urlencoded({extended:false}))
Router.use(express.static(path.join(__dirname,'user')))

var sess

// Page Register_User
Router.get('/register', (req, res,next)=>{
    if (req.session.Registered){
        res.render('user/register_form',{
            "Registered":req.session.Registered
        })
    }else{
        res.render('user/register_form.ejs')
    }
})
// POST from Register_User
Router.post('/register',(req,res,next)=>{
    delete req.session.Registered
},UserController.register_user)


// RENDER LOGIN
Router.get('/login',(req,res,next)=>{
    delete req.session.Registered
    if (req.session.Wrong){
        res.render('user/login_form.ejs',{
            "Wrong":req.session.Wrong
        })
    } else {
        res.render('user/login_form.ejs')
    }
    
})
// POST LOGIN
Router.post('/login',UserController.login_user)

// If User Logined and Success
Router.get('/logged',UserController.authenticated,(req,res,next)=>{
    // console.log(session.id)
    delete req.session.Success
    delete req.session.Failed
    usr=req.session.usr
    // id=req.query.id
    id=req.session.id
    res.render('user/user_page.ejs',{
        "id":id,
        "usr":usr
    })
})
// GET USER FROM SESSION
Router.get('/get_user',UserController.get_user)

//Profile User
Router.get('/profile',(req,res,next)=>{
    res.render('user/user_profile.ejs')
})

Router.post('/profile',UserController.logged_user,(req,res,next)=>{

})

// DELETE Session data after Log out
Router.get('/log_out',UserController.log_out,(req,res,next)=>{
    // console.log("LOGOUT")
})




module.exports=Router