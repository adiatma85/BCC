const express = require('express')
const app = express()
const db=require('../database')
const bcrypt=require('bcryptjs')
const session=require('express-session')
const flash = require('req-flash');
const bodyParser=require('body-parser')
const url=require('url')
const multer=require('multer')
const path = require('path')

// Set Storage Device
const storage = multer.diskStorage({
    destination: 'public/uploads/photoProfile',
    filename : (req,file,cb)=>{
        cb(null,req.session.id_user + '-' + Date.now() + path.extname(file.originalname))
    }
})

// Init Upload
const upload = multer({
    storage:storage,
    limits:{
        fileSize: 10000000
    },
    fileFilter:function(req,file,cb){
        checkFileType(file,cb)
    }
}).single('ProfilePic')

//CheckingFile
function checkFileType(file,cb){
    //Allowed Ext
    const filetype = /jpeg|jpg|png/
    //Check Ext
    const extname = filetype.test(path.extname(file.originalname).toLowerCase())
    //Check Mime
    const mimetype = filetype.test(file.mimetype)

    if  (mimetype && extname){
        return cb(null,true)
    } else {
        cb('Error: Images Only')
    }
}

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

// Get Specified User
const get_user= async(req,res,next)=>{
    const [check]=await db.query('select * from users where id=?',[sess])
    console.log(sess)
    res.redirect(url.format({
        "id":sess,
        pathname: 'user/logged'
    }))
}
// Register user
const register_user = async(req,res,next)=>{
    const name=req.body.name
    const email=req.body.email
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
    }
    res.redirect('/user/login')
}

// Login User
const login_user = async(req, res, next)=>{
    delete req.session.WrongMsg
    const username=req.body.username
    const user_password=req.body.password
        const [check]=await db.query('select * from users where username=?',[username])
        if (check.length==0){
            req.session.WrongMsg='Wrong Usename!'
            return res.redirect('/user/login')
        }
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
                req.session.WrongMsg='Wrong Password!'
                res.redirect('/user/login')
            }
}

const Uploading = (req,res,next)=>{
    upload(req,res,(err)=>{
        if (err) {
            req.session.pic={
                msg: err
            }
        } else {
            if (req.file == undefined) {
                req.session.pic={
                    msg: 'Error: No File Selected'
                }
            } else {
                req.session.pic={
                    msg: 'File Uploaded!',
                    files: req.file
                }
            }
        }
        next()
    },next)
}

// The User have privilege to change their Profile
const editUserProfile = async (req,res,next)=>{
    // Getting All Data Required
    const item_file = req.session.pic.files
    const biography = req.body.biography
    const address = req.body.address
    const contact = req.body.contact
    // After Get
    // console.log(biography + address + contact)

    //Insert to DB
    await db.query('UPDATE users SET biography=?, address=?, contact=?, profilPic_path=? WHERE id=?',[biography,address,contact,item_file.filename,req.session.id_user])
    .then(()=>{
        req.session.P_message= 'Upload Success!'
    }).catch((err)=>{
        console.log('TEST ERROR')
        req.session.P_message= 'There is error!'
    })
    res.redirect('/user/profile')
}

const getSpecifiedUser = async (req,res,next)=>{
    const [SpecifiedUser] = await db.query('SELECT * FROM users WHERE id=?',[req.params.id])
    const [Auxtion_Total] = await db.query('SELECT COUNT(id_user) FROM items WHERE id_user=?',[req.params.id])
    res.locals.SpecifiedUser = {
        User: SpecifiedUser,
        Aux: Auxtion_Total
    }
    next()
}

const getSpecifiedNotif = async (req,res,next)=>{
    const [Specified_Notif] = await db.query('SELECT * FROM items WHERE id=?',[req.params.id])
    res.locals.SpecifiedNotif = Specified_Notif[0]
    next()
}

// The User LogOut
const log_out= (req,res,next)=>{
        req.session.destroy((err)=>{
            if (err){
                return console.log(err)
            }
            res.redirect('/')
        })
}
// Check if the user is Authenticated
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
    log_out,
    get_user,
    editUserProfile,
    Uploading,
    getSpecifiedUser,
    getSpecifiedNotif,
    authenticated
}