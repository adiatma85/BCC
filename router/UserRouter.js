
const express = require('express')
const app = express()
const Router=express.Router()
const bodyParser=require('body-parser')
const path=require('path')
const UserController=require('../controller/UserController')
const Is_Notif=require('../controller/ItemsController')
const session=require('express-session')
// const methodOverride = require('method-override')

const is_data=require('../controller/ItemsController')

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
// Router.use(express.static(path.join(__dirname,'user')))

var sess

// Page Register_User
Router.get('/register', (req, res,next)=>{
    if (req.session.Registered){
        // console.log(req.session.Registered.message)
        res.render('user/register_form.ejs',{
            "Registered":req.session.Registered
        })
    }else{
        req.session.Registered={
            type: 'Neutral',
            message: ''
        }
        res.render('user/register_form.ejs',{
            "Registered":req.session.Registered
        })
    }
})
// POST from Register_User
Router.post('/register',(req,res,next)=>{
    // delete req.session.Registered_Success
    // delete req.session.Registered_Failed
    delete req.session.Registered
    next()
},UserController.register_user)


// RENDER LOGIN
Router.get('/login',(req,res,next)=>{
    delete req.session.Registered
    if (req.session.WrongMsg){
        // console.log(req.session.WrongMsg)
        res.render('user/login_form.ejs',{
            "Wrong" : req.session.WrongMsg
        })
    } else {
        res.render('user/login_form.ejs')
    }
    
})
// POST LOGIN
Router.post('/login',UserController.login_user)

// If User Logined and Success
Router.get('/logged',UserController.authenticated,is_data.getAllItem,(req,res,next)=>{
    // console.log(session.id)
    delete req.session.Success
    delete req.session.Failed
    usr=req.session.usr
    // id=req.query.id
    id=req.session.id
    res.render('user/user_page.ejs',{
        "id":id,
        "usr":usr,
        item: res.locals.Items
    })
})

Router.get('/notif',Is_Notif.notification,(req,res,next)=>{
    // console.log(res.locals.notification)
    res.render('user/notif.ejs',{
        notif_data: res.locals.notification
    })
})

Router.get('/notif/of/:id',Is_Notif.notification,UserController.getSpecifiedNotif,(req,res,next)=>{
    res.render('user/e_notif.ejs',{
        notif_data: res.locals.SpecifiedNotif,
        image_path: `../../../uploads/item/${res.locals.SpecifiedNotif.item_filename}`
    })
})

// GET USER FROM SESSION
Router.get('/get_user',UserController.get_user)

//Profile User
Router.get('/profile',UserController.authenticated,(req,res,next)=>{
    res.render('user/user_profile.ejs')
})
// Updating Profile User
Router.post('/profile',UserController.authenticated,
UserController.Uploading,
UserController.editUserProfile,
(req,res,next)=>{
    res.redirect('/user/profile')
})

// Rendering Page Show to Spesificased User
Router.get('/of/:id',UserController.authenticated,UserController.getSpecifiedUser,(req,res,next)=>{
    const data_user=res.locals.getSpecifiedUser.User
    console.log(data_user)
    const Aux=res.locals.getSpecifiedUser.Aux
    console.log(Aux)
    res.render('user/e_user',{
        data_user: data_user,
        Aux: Aux
    })
})

// DELETE Session data after Log out
Router.get('/log_out',UserController.log_out,(req,res,next)=>{
    // console.log("LOGOUT")
})




module.exports=Router