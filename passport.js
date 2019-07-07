var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
	{email:'email',
	pwd:'pwd'},
  function(username, password, done) {
	console.log(username+password);
    UserReg.findOne({ email: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    })
  }
));
