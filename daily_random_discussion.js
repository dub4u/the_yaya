var rawjs    = require('raw.js');
var strftime = require('strftime');
var async    = require('async');
var config   = require('./lib/config');
var getQuote = require('./lib/quote');

// the actual post to be submitted
//
var submission = {
  'title': strftime('Daily random discussion - %b %d, %Y'),
  'text': strftime('Happy %A!!'),
  'r': config.defaults.subreddit,
  'inboxReplies': false,
  'save': false,
};

// first argument from the command line can be used to
// override the subreddit that we are submitting to
//
if (process.argv[2]) {
  submission.r = process.argv[2];
}

// the constructor gets the user agent string
//
var reddit = new rawjs('the_yaya-daily_random_discussion/1.0 by dub4u');
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

  // get a quote from the quote module
  //
  function(callback) {
    var silent = "Philippines" !== submission.r;
    getQuote(silent, function(quote) {
      if (quote) {
        submission.text = quote + '\n\n' + submission.text;
      }
      callback(null);
    });
  },

  // finally, submit the new daily random discussion
  //
  function(callback) {
    reddit.submit(submission, function(err, id) {
      if (err) {
        callback('Unable to submit post: ' + err);
      } else {
        callback(null, 'submitted ' + id);
      }
    });
  }
], function (err, result) {
  if (err) {
    error(err);
  } else {
    exit(result);
  }
});

// in case of error, log to STDERR and exit
//
function error(err) {
  exit('ERROR: ' + err);
}

function exit(msg) {
  console.log(strftime('%F %T ') + msg);
  process.exit();
}
