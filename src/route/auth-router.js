'use strict';

import bodyParser from 'body-parser';
import HttpError from 'http-errors';
import { Router } from 'express'; // keyword is de-structuring and module

import Account from '../model/account';
import basicAuthMiddleware from '../lib/basic-auth-middleware';
import logger from '../lib/logger';

const jsonParser = bodyParser.json();
const authRouter = new Router();

authRouter.post('/signup', jsonParser, (request, response, next) => {
  // in the request, we have a username, email, and password.
  if (!request.body.username || !request.body.email || !request.body.password) {
    logger.log(logger.INFO, 'Invalid request');
    throw new HttpError(400, 'Invalid request.');
  }
  return Account.create(request.body.username, request.body.email, request.body.password)
    .then((account) => {
    // we want to get rid of the password as early as possible.
      delete request.body.password;
      logger.log('logger.INFO', 'AUTH - creating TOKEN.');
      return account.createToken();
    })
    .then((token) => {
      logger.log('logger.INFO', 'AUTH - returning a 200 code and a token.');
      return response.json({ token });
    })
    .catch(next);
});

authRouter.get('/login', basicAuthMiddleware, (request, response, next) => {
  if (!request.account) {
    return next(new HttpError(400, 'AUTH - invalid request.'));
  }
  return request.account.createToken()
    .then((token) => {
      logger.log(logger.INFO, 'LOGIN - responding with a 200 status and a token.');
      return response.json({ token });
    })
    .catch(next);
});

export default authRouter;
