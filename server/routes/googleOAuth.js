const express = require("express");
const { generateToken, setTokenCookie } = require("../utils/generateToken");
const router = express.Router();
const passport = require("passport");

// Auth routes
router.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        accessType: 'offline',    // request refresh token
        prompt: 'consent'        // force consent to receive refresh token
    })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/failure' }),
    (req, res) => {
        // Successful authentication.
        // Option A: Issue JWT and set as httpOnly cookie
        const user = req.user;
        console.log(user);

        const token = generateToken({ id: user._id });

        // Set cookie (httpOnly)
        setTokenCookie(res, token);

        // Redirect to frontend route that knows how to handle logged-in user
        res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
    }
);

// optional endpoints
router.get('/auth/failure', (req, res) => res.send('Google auth failed'));


// Logout (clear cookie and optionally revoke refresh token)
router.post('/auth/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    req.logout?.(); // if using session
    res.json({ ok: true });
});

module.exports = router;