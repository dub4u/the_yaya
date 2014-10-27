var irc = require('irc'),
    config = require('./lib/config'),
    strftime = require('strftime'),
    format = require('irc-colors'),
    request  = require('request-json'),
    reddit = request.newClient('http://www.reddit.com/'),
    latest = 0;

var client = new irc.Client(config.irc.host, config.irc.nick, {
  channels: [config.irc.channel],
  messageSplit: 2048
});

client.addListener('registered', function(msg) {
  client.say('NickServ', 'identify ' + config.irc.pass);
});

client.addListener('error', function(err) {
  // if (err.rawCommand != '421') console.log(err);
  log('ERROR in irc client');
  console.log(err);
});

client.addListener('nick', function(oldnick, newnick) {
  log('-- ' + oldnick + ' is now known as ' + newnick);
});

client.addListener('join', function(channel, nick) {
  log('>> ' + nick + ' joined');
});

client.addListener('part', function(channel, nick, reason) {
  log('<< ' + nick + ' left (' + reason + ')');
});

client.addListener('quit', function(nick, reason) {
  log('<< ' + nick + ' quit (' + reason + ')');
});

client.addListener('topic', function(channel, topic, nick) {
  log('!! ' + nick + ' changed the topic to "' + topic + '"');
});

client.addListener('kick', function(channel, nick, by, reason) {
  log('<< ' + nick + ' was kicked by ' + by + '(' + reason + ')');
});

client.addListener('message', function(from, to, msg) {
  log(from + ' ' + to + ' ' + msg);
});

var say = function(msg) {
  client.say(config.irc.channel, msg)
  log(config.irc.nick + ' ' + config.irc.channel + ' ' + msg);
}

var log = function(msg) {
  console.log(strftime('%F %T ') + msg)
}

var debug = function(msg) {
  process.stderr.write(strftime('%T ') + msg + '\n');
}

// check for new r/philippines posts and if any
// are found, post them to the channel
//
var report_new_posts = function() {

  var url = '/user/the_yaya/m/all_pinoy/new/.json';

  reddit.get(url, function(err, res, body) {
    if (err) {
      log('ERROR fetching new posts');
      console.log(err);
    } else {

      if (body.data.children.length) {

        var init = (latest === 0);

        var children = body.data.children;

        for (var i = children.length-1; i >= 0; i--) {
          var post = children[i].data;

          if (post.created_utc > latest) {

            latest = post.created_utc;

            if (!init) {

              var msg = 'http://redd.it/' + post.id
                      + ' in r/' + post.subreddit + ':'
                      + ' ' + format.green.bold(post.title)
                      + ' by ' + format.brown.italic(post.author)

              if (post.selftext) {
                msg += ': ' + post.selftext.replace(/\n/g, ' ');;
              }

              say(msg);
            }
          }
        }
      }
    }
  });

  setTimeout(report_new_posts, 30000);
}; 

setTimeout(report_new_posts, 5000);
