const mysql=require('mysql2/promise')

const db=mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'Online_Auction'
})

db.query('select 1+1 as result',(err,result)=>{
    if (err) console.log(err)
    else console.log("Connected to DB")
})

module.exports=db