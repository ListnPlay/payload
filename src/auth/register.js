const mongoose = require('mongoose');
const passport = require('passport');
const AnonymousStrategy = require('passport-anonymous');
const passportLocalMongoose = require('passport-local-mongoose');
const jwtStrategy = require('./jwt');
const authRoutes = require('./routes');
const buildCollectionSchema = require('../collections/buildSchema');
const baseUserFields = require('../auth/baseFields');
const collectionRoutes = require('../collections/routes');

function registerUser() {
  this.config.user.fields.push(...baseUserFields);
  const userSchema = buildCollectionSchema(this.config.user, this.config);
  userSchema.plugin(passportLocalMongoose, { usernameField: this.config.user.auth.useAsUsername });
  this.User = mongoose.model(this.config.user.labels.singular, userSchema);

  passport.use(this.User.createStrategy());
  passport.use(jwtStrategy(this.User, this.config));
  passport.serializeUser(this.User.serializeUser());
  passport.deserializeUser(this.User.deserializeUser());
  passport.use(new AnonymousStrategy.Strategy());

  this.router.use(authRoutes(this.config, this.User));

  this.router.use(collectionRoutes({
    model: this.User,
    config: this.config.user,
  }));
}

module.exports = registerUser;