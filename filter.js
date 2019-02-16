// By Simon Lydell 2014.
// This file is in the public domain.

var cheerio = require("cheerio")

module.exports = function filter(text) {
    var $ = cheerio.load(text)
    var $content = $(".mw-parser-output")
      .children([
        "p",
        "blockquote",
        "ul",
        "ol:not(.references)",
        "dl"
      ].join(","))
    $content.find("sup").remove()
    return $content
      .text()
      .replace(/\r\n?/g, "\n") // Normalize newlines.
      .trim().replace(/\n{2,}/g, "\n\n") // Remove excessive newlines.
}

// The article itself is inside #mw-content-text (the rest is navigation and
// such-like).
//
// Immediate children of #mw-content-text are: Headings, paragraphs, block
// quotes, lists, tables and boxes (divs).
//
// We’re only interested in flowing text that is unique to the article. So of
// course all navigation and such-like is filtered out.
//
// Headings are omitted since most of them are the same, such as “Background”,
// “History”, “Criticism”, “Notes”, “References”, etc. Headings that actually
// _are_ unique to the article are usually repeated in the text, so we’re
// hardly missing out of them. It is better to filter them out, so that
// “References” does not bump the “er” pair too much. Moreover, each heading
// contains an “[edit]” link.
//
// Tables are omitted since they usually aren’t flowing text.
//
// “Needs review”, “Table of contents” and “This article is a stub” boxes are
// not unique to the article, and therefore omitted.
//
// Finally, all `<sup>` elements are removed since they are mostly “[5]”
// references and “[citation needed]”. They _can_ be part of mathematical
// stuff, but it doesn’t really matter if they are filtered out since that’s
// not really flowing text.
