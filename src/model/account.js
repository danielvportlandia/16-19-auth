'use strict';

import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // used to generate hash
import crypto from 'crypto'; // used to generate random data
import jsonWebToken from 'jsonwebtoken';
import HttpError from 'http-errors';

// CAPS naming conventions only apply to strings and numbers.
const HASH_ROUNDS = 8;
const TOKEN_SEED_LENGTH = 128;

const accountSchema = mongoose.Schema({
  passwordHash: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  tokenSeed: {
    type: String,
    required: true,
    unique: true,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

/* this function is going to be used to login
TODO: check code for where else this function is called. */
function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash)
    .then((result) => {
      if (!result) {
      // A 401 code would be the 'proper' response.
        throw new HttpError(400, 'AUTH - incorrect data.');
      }
      return this; // returns the entire current account.
    });
}

function createToken() {
  // 'this' is equal to the account object we are working with.
  this.tokenSeed = crypto.randomBytes(TOKEN_SEED_LENGTH).toString('hex');
  console.log('token Seed', this.tokenSeed);
  return this.save()
    .then((account) => {
      console.log('account.js', account);
    // at this point we have a tokenSeed.
    // .sign === encrypt, this line returns a promise which resolves to a token.
      return jsonWebToken.sign(
        { tokenSeed: account.tokenSeed },
        process.env.IMAGE_UPLOAD_SECRET,
      ); // When this promise resolves, I have a token.
    })
    .catch(() => {
      createToken();
    });
  // TODO: error management, recursive, make sure token is unique.
}

accountSchema.methods.verifyPassword = verifyPassword;
accountSchema.methods.createToken = createToken;

const Account = mongoose.model('account', accountSchema);

/* Hash variables: 
    - SALT
    - HASHING algorithm (bcrypt)
    - password
    - rounds
*/
Account.create = (username, email, password) => {
  return bcrypt.hash(password, HASH_ROUNDS)
    .then((passwordHash) => {
    // We have the password hash
    password = null; // eslint-disable-line
      const tokenSeed = crypto.randomBytes(TOKEN_SEED_LENGTH).toString('hex'); // hex is used due to HTTP
      return new Account({
        username,
        email,
        passwordHash,
        tokenSeed,
      }).save();
    });
};

export default Account;
