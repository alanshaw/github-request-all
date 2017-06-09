var request = require('request')
var parseLinkHeader = require('parse-link-header')
var Boom = require('boom')
var each = require('async-each')
var xtend = require('xtend')

module.exports = function (reqOpts, opts, cb) {
  if (!cb) {
    cb = opts
    opts = {}
  }

  opts = opts || {}

  reqOpts.qs = reqOpts.qs || {}
  reqOpts.qs.per_page = reqOpts.qs.per_page || opts.perPage || 100
  reqOpts.json = reqOpts.json || true
  reqOpts.headers = reqOpts.headers || {}
  reqOpts.headers['User-Agent'] = reqOpts.headers['User-Agent'] || opts.userAgent || 'github-request-all'

  request(reqOpts, function (err, res, body) {
    if (err) {
      return cb(Boom.wrap(err, 500, 'Failed to send request'))
    }

    if (res.statusCode !== 200) {
      return cb(Boom.create(res.statusCode, 'Unexpected status'))
    }

    var links = parseLinkHeader(res.headers.link)

    if (opts.onPage) opts.onPage(body)

    body = opts.filter ? body.filter(opts.filter) : body

    if (!links) return cb(null, body)

    var lastPage = parseInt(links.last.page, 10)

    // If the last page is this first page, we're done
    if (lastPage === 1) return cb(null, body)

    var pages = []
    for (var i = 2; i < lastPage + 1; i++) pages.push(i)

    each(pages, function (page, cb) {
      var reqOptsClone = xtend(reqOpts)
      reqOptsClone.qs = xtend(reqOpts.qs)
      reqOptsClone.qs.page = page

      request.get(reqOptsClone, function (err, res, body) {
        if (err) {
          return cb(Boom.wrap(err, 500, 'Failed to get page ' + page))
        }

        if (res.statusCode !== 200) {
          return cb(Boom.create(res.statusCode, 'Unexpected status'))
        }

        if (opts.onPage) opts.onPage(body)

        body = opts.filter ? body.filter(opts.filter) : body

        cb(null, body)
      })
    }, function (err, bodies) {
      if (err) return cb(err)
      cb(null, [].concat.apply(body, bodies))
    })
  })
}
