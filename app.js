var express = require("express");
var methodOverride = require("method-override");
var app = express();
var expressSanitizer = require("express-sanitizer");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");


//APP CONFIG
app.use(require("express-session")({
    secret: "Pattern is the best",
    resave: false,
    saveUninitialized: false
}));
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:"true"}));
app.use(expressSanitizer());//must be after bodyParser
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//ROUTES
//===============
app.get("/",function(req,res){

	res.render("Final/index.ejs");
});

//login logic
app.get("/login",function(req,res){

	res.render("login.ejs");
});

//middleware
app.post("/login",passport.authenticate("local",{
	successRedirect: "/secret",
	failureRedirect: "/login"
}),function(req,res){

});

app.get("/secret",isLoggedIn,function(req,res){
	res.render("secret.ejs");
});

app.get("/register",function(req,res){
	res.render("signup.ejs");
});

app.post("/register",function(req,res){
	User.register(new User({username:req.body.username,email:req.body.email,firstname:req.body.firstname,lastname:req.body.lastname,phoneno:req.body.phoneno}),req.body.password,function(err,user){
          if(err ){
          	console.log(err);
          	return res.render("signup");
          }
          passport.authenticate("local")(req,res,function(){
          	res.redirect("/secret");
          })
          
	});
});

//logout
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});


function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

app.listen(process.env.PORT || 3000,process.env.IP,function(){
		console.log("PORT IS LISTENING");
	});