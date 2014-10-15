var irc = require('irc'),
    config = require('./lib/config'),
    strftime = require('strftime'),
    format = require('irc-colors'),
    rawjs = require('raw.js'),
    reddit = new rawjs('the_yaya-snoonet_bot/1.0 by dub4u'),
    before;

reddit.setupOAuth2(config.app.id, config.app.secret);

var client = new irc.Client(config.irc.host, config.irc.nick, {
  channels: [config.irc.channel]
});

client.addListener('registered', function(msg) {
  client.say('NickServ', 'identify ' + config.irc.pass);
});

client.addListener('error', function(err) {
  // if (err.rawCommand != '421') console.log(err);
  console.log(err);
});

client.addListener('message', function(from, to, msg) {
  log(from + ' ' + to + ' ' + msg);
});

var say = function(msg) {
  client.say(config.irc.channel, msg)
}

var log = function(msg) {
  console.log(strftime('%F %T ') + msg)
}

// check for new r/philippines posts
//
var new_post = function() {

  var options = {
    r: 'Philippines',
    limit: 5,
    all: true
  };

  if (before) {
    options.before = before;
  }

  reddit.new(options, function(err, response) {
    if (err) {
      log('error');
      console.log(err);
    } else {
      if (response.children.length) {
        if (before) {
          for (var i = response.children.length-1; i >= 0; i--) {
            (function(post) {
              setTimeout(function() {
                var msg = format.green.underline('http://redd.it/' + post.id)
                    + ' ' + format.navy.bold(post.title)
                    + ' by ' + format.brown.italic(post.author)

                if (post.selftext) {
                  msg += ': ' + post.selftext;
                }

                say(msg);

              }, 800)
            })(response.children[i].data);
          }
        }

        before = response.children[0].data.name;
      }
    }
  });

  setTimeout(new_post, 30000);
}; 

setTimeout(new_post, 15000);
