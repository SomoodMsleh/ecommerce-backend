import passport from "passport";
import logger from "../utils/logger.util.js";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import ApiError from "../utils/error.util.js";
import userModel from "../models/User.model.js";


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.CLIENT_URL}/api/v1/auth/google/callback`,
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            logger.info(`Google OAuth attempt for email: ${email}`);
            if (!email) {
                return done(new ApiError("Google account has no email", 400));
            }

            let user = await userModel.findOne({ googleId: profile.id });
            if (!user) {
                user = await userModel.findOne({ email });
            }

            if (user) {
                if (!user.googleId){
                    user.googleId = profile.id;
                }
                user.isEmailVerified = true;
                if (!user.avatar && profile.photos?.[0]?.value) {
                    user.avatar = profile.photos?.[0]?.value;
                }
                user.lastLogin = new Date();
                await user.save();
                logger.info(`Linked Google account to existing user: ${user.email}`);
                return done(null,user);
            }
            const newUser = await userModel.create({
                googleId: profile.id,
                email: email,
                firstName: profile.name?.givenName || "user",
                lastName: profile.name?.familyName || "",
                username: `${email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")}${Date.now()}`,
                avatar: profile.photos?.[0]?.value,
                isEmailVerified: true,
                isActive: true,
                lastLogin : new Date()
            });
            logger.info(`Created new user via Google OAuth: ${newUser.email}`);
            return done(null, newUser);
        } catch (error) {
            logger.error('Google OAuth error:', error);
            return done(error as Error, undefined)
        }
    }
));


export default passport;