// By Simon Lydell 2014.
// This file is in the public domain.

// Example invocation:
//
//     node list wiki/en >articles.txt
//
// The above is like running `ls wiki/en`, except that any URL esapce sequences
// (such as %2F) in file names will be decoded.

var DIR = process.argv[2]

var fs = require("fs")

var list = fs.readdirSync(DIR)
  .map(decodeURIComponent)
  .join("\n")

process.stdout.write(list + "\n")
