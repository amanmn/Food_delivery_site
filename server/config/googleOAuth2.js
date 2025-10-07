const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.create({
                googleId: profile.id,
                email: profile.emails?.[0]?.value,
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value,
                authProvider: 'google'
            });
        }

        done(null, user); // must pass user object to done
    } catch (err) {
        done(err, null);
    }
}));

// serialize user into session — only store _id, not whole object
passport.serializeUser((user, done) => {
    if (!user || !user._id) {
        return done(new Error('User is missing _id'));
    }
    done(null, user._id);
});

// deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
