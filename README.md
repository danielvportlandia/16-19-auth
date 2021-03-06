**Author**: Daniel Shelton
**Version**: 1.1.4

# Overview
This is an application which performs CRUD operations via the Express framework to retreive, edit, add, and/or delete data from a MongoDB database consisting of accounts, profiles, and images. Account Schemas have user-names, emails, passwords and that generate tokens per successful login/signup. Profile Schemas consist of first names, birthdate, favorite quote, an avatar, as well as being associated with an account. Users are able to upload images to their profiles.

# Architecture
The main point of entry of this application is the index.js file which transpiles the app by utilizing the babel library. This application also utilizes multiple NPM libraries and .travis.yml for its CI. The 'lib' directory contains all the helper modules. The '__test__' directory contains the testing suite. This application utilizes a MongoDB database and is currently deployed via Heroku. 

# Paths

AUTH-POST ROUTE: Adds a new account to the MongoDB database.
- Successful POST operations result in a 200 status code.
- POST operations with missing required fields result in a 400 status code.
- POST operations containing a pre-existing unique value (e.g. email) will result in a 409 status code.
```javaScript
authRouter.post('/signup', jsonParser, (request, response, next) => {
  if (!request.body.username || !request.body.email || !request.body.password) {
    logger.log(logger.INFO, 'Invalid request');
    throw new HttpError(400, 'Invalid request.');
  }
  return Account.create(request.body.username, request.body.email, request.body.password)
    .then((account) => {
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
```

PROFILE-POST ROUTE: Adds a new profile associated to an account based off the account's id.
- Successful POST operations result in a 200 status code.
- POST operations with missing required fields result in a 400 status code.
```javaScript
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
```

IMAGE-POST ROUTE: Allows a user to post a new image to their profile.
```javaScript
imageRouter.post('/images', bearerAuthMiddleware, multerUpload.any(), (request, response, next) => {
  if (!request.account) {
    return next(new HttpError(404, 'IMAGE ROUTER ERROR, not found'));
  }

  if (!request.body.title || request.files.length > 1 || request.files[0].fieldname !== 'image') {
    return next(new HttpError(400, 'IMAGE ROUTER ERROR: invalid request.'));
  }

  const file = request.files[0];
  const key = `${file.filename}.${file.originalname}`;

  return s3Upload(file.path, key)
    .then((url) => {
      return new Image({
        title: request.body.title,
        account: request.account._id,
        url,
      }).save();
    })
    .then(image => response.json(image))
    .catch(next);
});
```

# Change Log

05-07-2018 10:15PM - POST route established for authentication, POST testing complete.
05-09-2018 8:02AM - POST route established for Profile, POST testing complete.
05-11-2018 7:13PM - Image Schema added.
05-13-2018 12:39PM - Site deployed.