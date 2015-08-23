// By Simon Lydell 2014.
// This file is in the public domain.

// Example invocation:
//
//     node wikipedia wiki/en 100
//
// The above will attempt to download 100 random English wikipedia articles, and
// save them in their entirety in the wiki/en/<article name>.
//
// You can pass yet a number to control how many articles can be downloaded at
// once.
//
// Lastly you can pass a different URL to wikipedia’s random page. For example,
// to download Swedish articles:
//
//     node wikipedia wiki/sv 5 2 https://sv.wikipedia.org/wiki/Special:Slumpsida
//
// Note that you have to run `npm install` before executing this script in order
// to get all dependencies first!

var DIR   = process.argv[2] || "."
var TIMES = Number(process.argv[3]) || 1
var LIMIT = Number(process.argv[4]) || 20
var URL   = process.argv[5] || "https://en.wikipedia.org/wiki/Special:Random"

var fs          = require("fs")
var path        = require("path")
var https       = require("https")
var timesLimit  = require("limited-parallel-loop")
var ProgressBar = require("progress")

var REGEX = /^https:\/\/[a-z]+\.wikipedia\.org\/wiki\/(.+)$/
var ESCAPED_SLASH = encodeURIComponent("/")



var bar = new ProgressBar("[:bar] :current/:total (:percent) :info", {
  total:      TIMES,
  width:      20,
  stream:     process.stdout,
  complete:   "=",
  incomplete: " ",
  clear:      true
})
bar.render({info: ""})

var errors = []

timesLimit(TIMES, LIMIT, function(done) {
  var end = function (url, error) {
    var info = url + (error ? " - " + error.toString() : "")
    if (error) {
      errors.push(info)
    }
    bar.tick({info: info})
    done()
  }

  get(URL, 302, function(response) {

    var location = response.headers.location
    var match = REGEX.exec(location)
    if (!match) {
      return end(URL, new Error("Unuseful redirect: " + location))
    }
    var name = match[1].replace(/\//g, ESCAPED_SLASH)

    get(location, 200, function(response) {
      var output = path.join(DIR, name)
      var write = fs.createWriteStream(output)
      write.on("error", end.bind(null, output))

      response.pipe(write)
      response.on("end", end.bind(null, decodeURIComponent(name)))
    }, end)

  }, end)
}, function() {
  bar.render({info: "\n"})
  if (errors.length > 0) {
    process.stderr.write(errors.join("\n") + "\n")
    process.exit(1)
  }
  process.exit(0)
})



function get(url, statusCode, callback, errback) {
  https.get(url, function(response) {
    if (response.statusCode !== statusCode) {
      return errback(url, new Error(
        "Bad status code: Expected " + statusCode + " but got " +
        response.statusCode
      ))
    }
    callback(response)
  }).on("error", errback.bind(null, url))
}
