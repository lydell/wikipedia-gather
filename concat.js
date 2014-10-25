// By Simon Lydell 2014.
// This file is in the public domain.

// Example invocation:
//
//     node concat wiki/en >text.txt
//
// The above is like running `cat wiki/*`, except that the files are joined with
// \0 and are expected to be wikipedia HTML articles which are filtered for
// their unique, flowing text (see filter.js).

var DIR = process.argv[2]

var fs     = require("fs")
var path   = require("path")
var filter = require("./filter")

// Reading 5000 files took about 5s on my system, which is acceptable. Also
// `filter`ing them took 50s. Even if async reading could reduce the reading
// time to near 0s it wouldn’t be noticeable, so let’s keep things simple and do
// it sync.
var text = fs.readdirSync(DIR)
  .map(function(file) {
    return filter( fs.readFileSync(path.join(DIR, file)).toString() )
  })
  .join("\0")
  // The files are joined with \0 because:
  //
  // - They must be joined with something. Otherwise the last word of one file
  //   will be joined with the first word of the next file.
  // - Joining with for example \n would bump \n. \0, on the other hand, is
  //   not present in the files.

process.stdout.write(text)
