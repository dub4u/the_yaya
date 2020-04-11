var strftime = require('strftime');
var request  = require('request-json');
var config   = require('./lib/config');
var reddit   = require('./lib/reddit');

// first argument from the command line can be used to
// override the subreddit that we are submitting to
//
if (process.argv[2]) {
  config.defaults.subreddit = process.argv[2];
}

// the actual post to be submitted
//
var submission = {
  'title': strftime('Afternoon random discussion - %b %d, %Y'),
  'text': config.slogan + 'Magandang hapon r/' + config.defaults.subreddit + '!',
  'r': config.defaults.subreddit,
  'inboxReplies': false,
  'save': false,
};

reddit.submit(submission, function(err, id) {
  if (err) {
    error(err);
  } else {
    log('submitted ' + id);

    var client = request.newClient('http://www.reddit.com/'),
        url = '/r/AskReddit/top/.json';

    client.get(url, function(err, res, body) {
      if (!err) {
        try {
          post = body.data.children[0].data
        } catch(e) {}
        if (post) {
          var text = 'This afternoon\'s [Ask PHreddit](' + post.url + '): '
                   + post.title;
          reddit.comment('t3_' + id, text, function(err, id) {
            if (err) {
              error(err);
            } else {
              exit('commented ' + id);
            }
          });
        }
      }
    });

  }
});

// in case of error, log to STDERR and exit
//
function error(err) {
  exit('ERROR: ' + err);
}

function log(msg) {
  console.log(strftime('%F %T ') + msg);
}

function exit(msg) {
  log(msg);
  process.exit();
}
