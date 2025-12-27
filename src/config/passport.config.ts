import passport from "passport";
import logger from "../utils/logger.util.js";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import ApiError from "../utils/error.util.js";
import userModel from "../models/User.model.js";

const generateUsername = (email: string) =>
  `${email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")}${Date.now()}`;

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
                if (!user.googleId) {
                    user.googleId = profile.id;
                }
                user.isEmailVerified = true;
                if (!user.avatar?.url && profile.photos?.[0]?.value) {
                    user.avatar = { url: profile.photos?.[0]?.value };
                }
                user.lastLogin = new Date();
                await user.save();
                logger.info(`Linked Google account to existing user: ${user.email}`);
                return done(null, user);
            }
            const newUser = await userModel.create({
                googleId: profile.id,
                email: email,
                firstName: profile.name?.givenName || "user",
                lastName: profile.name?.familyName || "",
                username: generateUsername(email),
                avatar: { url: profile.photos?.[0]?.value },
                isEmailVerified: true,
                isActive: true,
                lastLogin: new Date()
            });
            logger.info(`Created new user via Google OAuth: ${newUser.email}`);
            return done(null, newUser);
        } catch (error) {
            logger.error('Google OAuth error:', error);
            return done(error as Error, undefined)
        }
    }
));



passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || `${process.env.CLIENT_URL}/api/v1/auth/facebook/callback`,
    profileFields:['id','emails','name','picture.type(large)']
},
    async (accessToken:string, refreshToken:string, profile:any, done:any) => {
        try{
            const email = profile.emails?.[0]?.value;
            logger.info(`Facebook OAuth attempt for email: ${email}`);
            if (!email) {
                return done(new ApiError("Facebook account has no email", 400));
            }

            let user = await userModel.findOne({ facebookId: profile.id });
            if (!user) {
                user = await userModel.findOne({ email });
            }

            if (user) {
                if (!user.facebookId) {
                    user.facebookId = profile.id;
                }
                user.isEmailVerified = true;
                if (!user.avatar?.url && profile.photos?.[0]?.value) {
                    user.avatar = { url: profile.photos?.[0]?.value };
                }
                user.lastLogin = new Date();
                await user.save();
                logger.info(`Linked Facebook account to existing user: ${user.email}`);
                return done(null, user);
            }

            const newUser = await userModel.create({
                facebookId: profile.id,
                email: email,
                firstName: profile.name?.givenName || "user",
                lastName: profile.name?.familyName || "",
                username: generateUsername(email),
                avatar: { url: profile.photos?.[0]?.value },
                isEmailVerified: true,
                isActive: true,
                lastLogin: new Date()
            });
            logger.info(`Created new user via Facebook OAuth: ${newUser.email}`);
            return done(null, newUser);

        }catch(error){
            logger.error('Facebook OAuth error:', error);
            return done(error as Error, undefined)
        }
    }
));

export default passport;