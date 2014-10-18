var rawjs = require('raw.js'),
    async = require('async'),
    config = require('../config'),
    reddit = new rawjs(config.user_agent),
    authenticated = false;

reddit.setupOAuth2(config.app.id, config.app.secret);

var authenticate = function(callback) {

  if (authenticated) {
    callback(null);
    return;
  }

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
    }
  ], function(err) {
    authenticated = true;
    callback(err);
  });

};

var submit = function(submission, callback) {

  async.waterfall([

    function(callback) {
      authenticate(callback);
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

};

var comment = function(parent, text, callback) {
  async.waterfall([

    function(callback) {
      authenticate(callback);
    },

    // comment
    //
    function(callback) {
      reddit.comment(parent, text, function(err, comment) {
        if (err) {
          callback('Unable to comment: ' + err);
        } else {
          callback(null, comment.data.id);
        }
      });
    }
  ], callback);

};


module.exports = {
  submit: submit,
  comment: comment
}
