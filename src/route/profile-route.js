'use strict';

import { Router } from 'express'; // keyword is de-structuring and module
import { json } from 'body-parser';
import HttpError from 'http-errors';

import Profile from '../model/profile';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';
import logger from '../lib/logger';

const jsonParser = json();
const profileRouter = new Router();

profileRouter.post('/profiles', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  if (!request.account || !request.body.firstName) {
    return next(new HttpError(400, 'AUTH - invalid request'));
  }
  return new Profile({
    ...request.body,
    account: request.account._id,
  })
    .save()
    .then((profile) => {
      logger.log(logger.INFO, 'Returning a 200 and a new Profile.');
      return response.json(profile);
    })
    .catch(next);
});

export default profileRouter;
