var express=require("express");
var router=express.Router();
var passport=require("passport");
var UserReg=require("./UserReg");
router.get("/login",(req,res)=>{
	res.render("signin");
})
router.get("/register",(req,res)=>{

	res.render("register");
})
router.post("/register",(req,res)=>{
	var name=req.body.name;
	var email=req.body.email;
	var pwd=req.body.pwd;

	let msg=new UserReg({
		Name:name,
		Password:pwd,
		Email:email
		

	 });
	 msg.save().then((doc)=>{
		 console.log(doc);
	 }).catch(err=>{
		 console.log(err);
	 })
	 res.redirect("/")

})

router.post('/auth', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/users/' + user.username);
      });
    })(req, res, next);
  }
)
module.exports=router;