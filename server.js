const express = require("express")
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios")
var cors = require('cors')
const app = express();
app.use(cors())
app.use(express.json())


const db  = new sqlite3.Database('./PIMDatabase.db' , sqlite3.OPEN_READWRITE , (err)=> {
    if(err) return console.log(err);
    console.log('PIMDatabase Connected')
})

app.get("/getCredential" , (req,res) => {
    db.all('select * from credential' , (err,rows)=>{
        if(err) return res.error(err);
        return res.json(rows.map((x)=>{
            return{
                id:x.id , 
                PIMItemType:0 ,
                credential:{
                    application: x.application,
                    url: x.url , 
                    user: x.user ,
                    password : x.password
                }
            }
        }));
    })
})

app.get("/getAddress" , (req,res) => {
    db.all('select * from address' , (err,rows)=>{
        if(err) return res.error(err);
        return res.json(rows.map((x)=>{
            return {
                id:x.id , 
                PIMItemType:1,
                address:{
                    type: x.type,
                    address: x.address,
                    street: x.street,
                    city: x.city,
                    state: x.state,
                    pincode: x.pincode,
                    country: x.country
                }
            }
        }));
    })
})

app.get("/getPayment" , (req,res) => {
    db.all('select * from payment' , (err,rows)=>{
        if(err) return res.error(err);
        return res.json(rows.map((x)=>{
            return {
                id:x.id,
                PIMItemType:2,
                payment:{
                    type:x.type , 
                    number:x.number,
                    expiry:x.expiry,
                    name:x.name
                }
            }
        }))
    })
})

app.get("/getPIMData" , async(req,res) => {
    let cred = await axios.get('http://localhost:8000/getCredential');
    let add = await axios.get('http://localhost:8000/getAddress');
    let pay = await axios.get('http://localhost:8000/getPayment');
    return res.json([...(cred.data) , ...(add.data) , ...(pay.data)]);
})

app.get("/user" , async(req,res) => {
    db.all(`select * from user where email='shobitnair10@gmail.com'` , (err,rows)=>{
        if(err) return res.error(err);
        return res.json(rows.map((x)=>{
            return x;
        }))
    })
})

app.post("/user/in" , async(req,res) => {
    const {meta} = req.body;
    console.log(meta);
    db.run(`insert into user (email , status , meta) values (?,?,?)` , [
        "shobitnair10@gmail.com" , "IN" , JSON.stringify(meta)
    ], (err) => {
        return res.json({ok:"ok"})
    }
    );
})

app.post("/user/out" , async(req,res) => {
    db.run('delete from user where email = ?' , ["shobitnair10@gmail.com"] , (err)=>{
        return res.json({ok:"ok"})
    })
})

app.listen(8000 , () => {
    console.log("Listening at port 8000")
} )