'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.s3Remove = exports.s3Upload = undefined;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var s3Upload = function s3Upload(path, key) {
  var AWS = require('aws-sdk');
  var amazonS3 = new AWS.S3();

  var uploadOptions = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    ACL: 'public-read',
    Body: _fsExtra2.default.createReadStream(path) // creates a readable stream
  };

  return amazonS3.upload(uploadOptions).promise() // this little cased promise calls the internal call back of the .upload()
  .then(function (response) {
    // console.log('response from S3', response);
    return _fsExtra2.default.remove(path).then(function () {
      return response.Location;
    }).catch(function (error) {
      return Promise.reject(error);
    });
  }).catch(function (error) {
    return _fsExtra2.default.remove(path).then(function () {
      return Promise.reject(error);
    }).catch(function (fsErr) {
      return Promise.reject(fsErr);
    });
  });
};

var s3Remove = function s3Remove(key) {
  var AWS = require('aws-sdk');
  var amazonS3 = new AWS.S3();
  var removeOptions = {
    Key: key,
    Bucket: process.env.AWS_BUCKET
  };

  return amazonS3.deleteObject(removeOptions).promise();
};

exports.s3Upload = s3Upload;
exports.s3Remove = s3Remove;