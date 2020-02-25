const express = require('express')
const app = express()
const db=require('../database')
const session=require('express-session')
const flash=require('req-flash')
const bodyParser=require('body-parser')
const url=require('url')
const countdown=require('countdown')
const multer=require('multer')
const path = require('path')

// Set Storage Device
const storage = multer.diskStorage({
    destination: 'public/uploads/item',
    filename : (req,file,cb)=>{
        cb(null,req.session.id_user + '-' + Date.now() + path.extname(file.originalname))
    }
})


// Init Upload

const upload = multer({
    storage:storage,
    limits:{fileSize: 10000000},
    fileFilter:function(req,file,cb){
        checkFileType(file,cb)
    }
}).single('itemsPhoto')

// CheckingFile
function checkFileType(file,cb){
    //Allowed Ext
    const filetype = /jpeg|jpg|png/
    //Check Ext
    const extname = filetype.test(path.extname(file.originalname).toLowerCase())
    //Check Mime
    const mimetype = filetype.test(file.mimetype)

    if (mimetype&&extname){
        return cb (null,true)
    } else {
        cb('Error: Images Only!')
    }
}

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

const getAllItem=async (req,res,next)=>{
    const [item_get]=await db.query('select * from items WHERE item_status=?',[0])
    res.locals.Items=item_get
    next()
}

// Detect if there's expired or no

const expiredCheck=async (req,res,next)=>{
    const [item_get]=await db.query('select * from items WHERE item_status=?',[0])
    for(i=0;i<item_get.length;i++){
        var timing=new Date(
            item_get[i].date_year,
            item_get[i].date_month,
            item_get[i].date_day,
            item_get[i].date_hour,
            item_get[i].date_minute,
            item_get[i].date_second
        )
        var value=countdown(null,timing)
        if(value.value <= 0){
            db.query('UPDATE items SET item_status=? WHERE id=?',[1,item_get[i].id])
        }
    }
    next()
}
const add_item=async (req,res,next)=>{
    // Getting all Data Required
    const item_file=req.session.item_e.files
    // console.log(item_file.path)
    const item_name=req.body.item_name
    const item_desc=req.body.item_desc
    const item_bid=req.body.item_bid
    const id_user=req.session.id_user
    const dead_time=req.body.Time_Duration // Time-Duration in Hours

    // Pre-Date Config
    const date_now=new Date()
    const obj_date={
        "Year":date_now.getFullYear(),
        "Month":date_now.getMonth(),
        "Date":date_now.getDate(),
        "Hours":date_now.getHours(),
        "Minutes":date_now.getMinutes(),
        "Seconds":date_now.getSeconds()
    }
    // console.log(obj_date.Date)
    // console.log(obj_date.Hours)
    const dead_Hour=obj_date.Hours + Number.parseInt(dead_time)
    
    const final_time=new Date(
        obj_date.Year,
        obj_date.Month,
        obj_date.Date,
        dead_Hour,
        obj_date.Minutes,
        obj_date.Seconds
    ) //Send to Database
    // After-Date Config

    // await db.query('insert into items(date_year, date_month, date_day, date_hour, date_minute, date_second) values(?,?,?,?,?,?)',[obj_date.Year, obj_date.Month, obj_date.Date, dead_Hour, obj_date.Minutes, obj_date.Seconds])
    await db.query('insert into items(id_user,item_name,item_desc,item_bid,item_status, date_year, date_month, date_day, date_hour, date_minute, date_second, item_filename) values(?,?,?,?,?,?,?,?,?,?,?,?)',[id_user,item_name,item_desc,item_bid,0,obj_date.Year, obj_date.Month, obj_date.Date, dead_Hour, obj_date.Minutes, obj_date.Seconds, item_file.filename])
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

// UPLOADING

const Uploading= (req,res,next)=>{
    upload(req,res,(err)=>{
        if (err){
            req.session.item_e={
                msg: err
            }
        } else{
            if(req.file == undefined){
                req.session.item_e={
                    mgs: 'Error: No File Selected'
                }
            } else {
                req.session.item_e={
                    msg: 'File Uploaded!',
                    files: req.file
                }
            }
        }
        // console.log(req.session.item_e.files)
        next()
    },next)
    
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
    getAllItem,
    Uploading,
    expiredCheck,
    testing
}