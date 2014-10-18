var strftime = require('strftime');
var config   = require('./lib/config');
var getQuote = require('./lib/quote');
var reddit   = require('./lib/reddit');

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

var silent = "Philippines" !== submission.r;

getQuote(silent, function(quote) {
  if (quote) {
    submission.text = quote + '\n\n' + submission.text;
  }
  reddit.submit(submission, function(err, id) {
    if (err) {
      error(err);
    } else {
      exit('submitted ' + id);
    }
  });
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
