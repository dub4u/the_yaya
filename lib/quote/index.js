var fs = require('fs'),
    join = require('path').join,
    request  = require('request-json'),
    strftime = require('strftime'),
    quotefile = join(__dirname, 'quotes.json'), // optional quote array
    logfile   = join(__dirname, 'quotes.log'),  // Track posted quotes
    quotes = fs.existsSync(quotefile) ? require(quotefile) : [];

/*
 * Read the quote queue (JSON file containing array of quote strings)
 * and pick the top quote.
 *
 * If there is a quote, remove it from the quote queue.
 *
 * If there is no quote, get today's top quote from /r/quotes.
 * 
 * Parameter 'silent' can be used to prohibit any file system
 * changes such as shifting the quote queue or logging the quote.
 */
module.exports = function(silent, callback) {
  var quote = quotes.shift();

  if (quote) {
    if (!silent) {
      fs.writeFile(quotefile, JSON.stringify(quotes, null, "  "));
      log(quote);
    }
    callback(quote);
  } else {
    var client = request.newClient('http://www.reddit.com/'),
        url = '/r/quotes/top/.json';

    client.get(url, function(err, res, body) {
      if (!err) {
        try {
          quote = body.data.children[0].data.title;
        } catch(e) {}
      }
      if (!silent) {
        log(quote);
      }
      callback(quote);
    });
  }
}

function log(quote) {
  if (quote) {
    fs.appendFile(logfile, strftime('%F ') + quote + '\n');
  }
}
