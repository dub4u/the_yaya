var rawjs = require('raw.js'),
    async = require('async'),
    config = require('../config'),
    reddit = new rawjs(config.user_agent);

module.exports = function(submission, callback) {

  // the constructor gets the user agent string
  //
  var reddit = new rawjs(config.user_agent);
  reddit.setupOAuth2(config.app.id, config.app.secret);

  async.waterfall([

    // authenticate at reddit
    //
    function(callback) {
      reddit.auth(config.credentials, function(err, response) {
        if (err) {
          callback('Unable to authenticate user: ' + err);
        } else {
          callback(null);
        }
      });
    },

    // check that we're not required to solve a
    // captcha when posting
    //
    function(callback) {
      reddit.captchaNeeded(function(err, required) {
        if (err) {
          callback('captchaNeeded failed: ' + err);
        } else {
          if (required) {
            callback('Can not submit because captcha is needed');
          } else {
            callback(null);
          }
        }
      });
    },

    // submit
    //
    function(callback) {
      reddit.submit(submission, function(err, id) {
        if (err) {
          callback('Unable to submit post: ' + err);
        } else {
          callback(null, id);
        }
      });
    }
  ], callback);

}
