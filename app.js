const express=require('express');
var bodyParser=require('body-parser');

var session = require("express-session");
var exphbs=require('express-handlebars');
var User=require("./myschema");
var UserReg=require("./UserReg");
let Web3=require('web3');
let  Crypto = require('crypto-js');
require("./database");
const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
const app=express();

let id1="";
let name="";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // Set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
}
var myContract = new web3.eth.Contract(
	[
		{
			"constant": false,
			"inputs": [
				{
					"name": "x",
					"type": "address"
				},
				{
					"name": "y",
					"type": "string"
				},
				{
					"name": "size",
					"type": "uint256"
				},
				{
					"name": "hash",
					"type": "string"
				}
			],
			"name": "setUser",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "x",
					"type": "address"
				},
				{
					"name": "y",
					"type": "string"
				}
			],
			"name": "getFile",
			"outputs": [
				{
					"name": "",
					"type": "uint256"
				},
				{
					"name": "",
					"type": "string"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "x",
					"type": "address"
				}
			],
			"name": "getFilesById",
			"outputs": [
				{
					"components": [
						{
							"name": "fileid",
							"type": "string"
						},
						{
							"name": "size",
							"type": "uint256"
						},
						{
							"name": "hash",
							"type": "string"
						},
						{
							"name": "version",
							"type": "string[]"
						}
					],
					"name": "",
					"type": "tuple[]"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "x",
					"type": "address"
				},
				{
					"name": "y",
					"type": "string"
				}
			],
			"name": "getVersion",
			"outputs": [
				{
					"name": "",
					"type": "string[]"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		}
	]
	,"0xe2dae26c1a218888fbbca4352484041778b4087a");
app.engine('handlebars',exphbs({defaultLayout:'main'}))
app.use(express.static(`${__dirname}/public`));
app.set('view engine','handlebars')
app.use(express.static("public"));
app.use(session({ secret: "cats" ,saveUninitialized: true, resave: false,cookie: {maxAge:1200000}}));
app.get('/signout',(req,res)=>{


req.session.destroy(function(err) {
  if(err) {
    console.log(err);
  } else {
    res.redirect('/');
  }
});


})
app.get('/dashboard',(req,res)=>{
	req.session.update=false;
	
let inf='';

if(req.session.id1!=null){
var pro=myContract.methods.getFilesById(id1).call();  
pro.then(function(value) {
  console.log(value);
});
User.find({userid:id1}).then(doc=>{
inf=doc;
let x1=0;
if(inf.length>0)
x1=1;

res.render('dashboard',{name:name,id1:id1,info:inf,x:x1});
  }).catch(err=>{
console.log(err)

  });
  
}
else{
res.redirect('/');

}

})
app.post('/dashboard',(req,res)=>{
	
	UserReg.findOne({"Email":req.body.email},(err,obj)=>{
		if(err){
			console.log("Error:"+err);
			return err;
		}
		if(obj.Password==req.body.pwd){
			id1=obj.EthereumAddress;
			name=obj.Name;
		var x=obj.EthereumAddress;
		

		req.session.id1=x;
		req.session.name=obj.Name;
	
		req.session.update=false;

let inf='';

if(req.session.id1!=''){
var pro=myContract.methods.getFilesById(req.session.id1).call();  
pro.then(function(value) {
  console.log(value);
});

User.find({userid:id1}).then(doc=>{
inf=doc;
let x1=0;

if(inf.length>0)
x1=1;

res.render('dashboard',{name:name,id1:id1,info:inf,x:x1});

  }).catch(err=>{
console.log(err)

  });


  }
else{
res.redirect('/');

}

		}
		else{
			res.redirect("/");
		}

	});
	


})
app.get("/login",(req,res)=>{
	res.render("signin");
})
app.get("/register",(req,res)=>{

	res.render("register");
})
app.post("/register",(req,res)=>{
	var name=req.body.name;
	var email=req.body.email;
	var pwd=req.body.pwd;
	var ethaddress=req.body.ethadd;

	let msg=new UserReg({
		Name:name,
		Password:pwd,
		Email:email,
		EthereumAddress:ethaddress	
		

	 });
	 msg.save().then((doc)=>{
		 console.log(doc);
	 }).catch(err=>{
		 console.log(err);
	 })
	 res.redirect("/")

})
app.get("/share",(req,res)=>{
	if(req.session.id1!=null||id1!=null){
	let msg=new User({
		userid:req.session.id1,
		hash:req.query.hash,
		time:Date.now(),
		size:req.query.filesize,
		random:Crypto.SHA256(req.query.hash)

	 })
	 msg.save()
	 .then(doc => {
		 console.log(doc)
	 })
	 .catch(err => {
		 console.error(err)
	 })
	

	
	myContract.methods.setUser(req.query.ethaddress,req.query.fileid,req.query.filesize,req.query.hash).send({from:req.query.ethaddress,gas:3000000}).then((ans)=>{console.log("Share Successful"+ans);});;
	res.redirect("/dashboard");
	}
});



                                      
app.get('/',(req,res)=>{

res.render("index");

})

app.get('/create',(req,res)=>{
if(req.session.id1!=null)
res.render("createdoc");
else{
	res.redirect("/");
}


})
app.post('/create',(req,res)=>{
  
  let testBuffer = new Buffer(req.body.text);

   ipfs.files.add(testBuffer, function (err, file) {
       if (err) {
         console.log(err);
       }
       
        var hashval=file[0]["hash"]
        var size1=file[0]["size"]
        if(req.session.update){
          
          User.findOneAndUpdate(
            {
              _id:req.session.docid,
              hash:req.session.hash
            },
            {
              hash:hashval,
              time:Date.now(),
              size:size1,
              random:req.session.docid
              
            },
            {
              new: true
            }
            )
            .then(doc => {
              console.log(doc)
            })
            .catch(err => {
              console.error(err)
            });
         
						req.session.update=false;
					
           console.log(myContract.methods.setUser(id1,req.session.docid,size1,hashval).send({from:id1,gas:3000000})); 

        }
        else{
				
       
    myContract.methods.setUser(id1, Crypto256(hashval),size1,hashval).send({from:id1,gas:3000000}).then((ans)=>{console.log("send"+ans);});
       let msg=new User({
        userid:req.session.id1,
        hash:hashval,
        time:Date.now(),
        size:size1,
        random:Crypto.SHA256(hashval)

       })
       msg.save()
       .then(doc => {
         console.log(doc)
       })
       .catch(err => {
         console.error(err)
       })
      }

       
       
         
  
      })
res.redirect("/dashboard")
      
})
app.get('/:docid/:hash',(req,res)=>{
  const validCID =req.params.hash

  ipfs.files.get(validCID, function (err, files) {
      files.forEach((file) => {
        if(file.content.length>1)
        {
					
        myContract.methods.getFile(id1,req.params.docid).call().then((ans)=>{console.log(ans);});
          req.session.update=true;
          req.session.docid=req.params.docid;
          req.session.hash=req.params.hash;
        }
        else{
          req.session.update=false;
        }

       res.render("createdoc",{content:file.content})
      })
    })


})
app.get("/:docid",(req,res)=>{
	if(id1!=null){
	var pro=myContract.methods.getVersion(id1,req.params.docid).call();  
	pro.then(function(value) {
		console.log(value);
		
		res.render("version",{data:value,address:id1,fileid:req.params.docid});
	});
	}
	else{
		res.redirect("/");
	}
	});
app.listen(3000,(e,r)=>{
console.log("Listening on port 3000");

})
