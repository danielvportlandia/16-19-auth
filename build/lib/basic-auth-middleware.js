'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _account = require('../model/account');

var _account2 = _interopRequireDefault(_account);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// middleware is still a chainlink so it requires the request, response, and next args.
exports.default = function (request, response, next) {
  if (!request.headers.authorization) {
    return next(new _httpErrors2.default(400, 'AUTH - invalid request.'));
  }
  // Here means I have the header.
  var base64AuthHeader = request.headers.authorization.split('Basic ')[1];
  if (!base64AuthHeader) {
    return next(new _httpErrors2.default(400, 'AUTH - invalid request.'));
  }
  var stringAuthHeader = Buffer.from(base64AuthHeader, 'base64').toString();
  // at this point, this variable looks like "username:password"

  var _stringAuthHeader$spl = stringAuthHeader.split(':'),
      _stringAuthHeader$spl2 = _slicedToArray(_stringAuthHeader$spl, 2),
      username = _stringAuthHeader$spl2[0],
      password = _stringAuthHeader$spl2[1];
  // previous line is considered destructuring.


  if (!username || !password) {
    return next(new _httpErrors2.default(400, 'AUTH - invalid request.'));
  }
  // We now have a username and password
  return _account2.default.findOne({ username: username }).then(function (account) {
    if (!account) {
      return next(new _httpErrors2.default(400, 'AUTH - invalid request.'));
    }
    return account.verifyPassword(password);
  }).then(function (account) {
    // in this line, I have the correct account.
    request.account = account;
    return next();
  }).catch(next);
};