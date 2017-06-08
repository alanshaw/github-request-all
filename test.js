var http = require('http')
var url = require('url')
var test = require('tape')
var ghRequestAll = require('./')

function createTestApiServer (data) {
  var server = http.createServer(function (req, res) {
    var parsedUrl = url.parse(req.url, true)

    var perPage = parseInt(parsedUrl.query.per_page, 10) || 100
    var page = parseInt(parsedUrl.query.page, 10) || 1
    var lastPage = Math.ceil(data.length / perPage)

    var results = data.slice(page - 1, page + perPage - 1)
    var serverInfo = server.address()
    var apiUrl = 'http://' + serverInfo.address + ':' + serverInfo.port

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Link': '<' + apiUrl + '?page=' + (page + 1) + '>; rel="next", <' + apiUrl + '?page=' + lastPage + '>; rel="last"'
    })

    res.write(JSON.stringify(results, null, 2))
    res.end()
  })

  return server
}

test('Should get single page of data', function (t) {
  t.plan(5)

  var data = ['foo']
  var server = createTestApiServer(data)

  server.listen(3030, function (err) {
    t.ifError(err, 'No error starting test API server')

    ghRequestAll({
      url: 'http://localhost:3030'
    }, function (err, results) {
      t.ifError(err, 'No error requesting all data')
      t.equal(results.length, data.length, 'Correct amount of data returned')
      t.equal(results[0], data[0], 'Correct data returned')

      server.close(function (err) {
        t.ifError(err, 'No error stopping test API server')
        t.end()
      })
    })
  })
})

test('Should get two pages of data', function (t) {
  t.plan(6)

  var data = ['foo', 'bar']
  var server = createTestApiServer(data)

  server.listen(3030, function (err) {
    t.ifError(err, 'No error starting test API server')

    ghRequestAll({
      url: 'http://localhost:3030'
    }, {perPage: 1}, function (err, results) {
      t.ifError(err, 'No error requesting all data')
      t.equal(results.length, data.length, 'Correct amount of data returned')
      t.equal(results[0], data[0], 'Correct data returned')
      t.equal(results[1], data[1], 'Correct data returned')

      server.close(function (err) {
        t.ifError(err, 'No error stopping test API server')
        t.end()
      })
    })
  })
})

test('Should get three pages of data', function (t) {
  t.plan(7)

  var data = ['foo', 'bar', 'baz']
  var server = createTestApiServer(data)

  server.listen(3030, function (err) {
    t.ifError(err, 'No error starting test API server')

    ghRequestAll({
      url: 'http://localhost:3030'
    }, {perPage: 1}, function (err, results) {
      t.ifError(err, 'No error requesting all data')
      t.equal(results.length, data.length, 'Correct amount of data returned')
      t.equal(results[0], data[0], 'Correct data returned')
      t.equal(results[1], data[1], 'Correct data returned')
      t.equal(results[2], data[2], 'Correct data returned')

      server.close(function (err) {
        t.ifError(err, 'No error stopping test API server')
        t.end()
      })
    })
  })
})

test('Should call onPage callback for each page', function (t) {
  t.plan(6)

  var data = ['foo', 'bar', 'baz']
  var server = createTestApiServer(data)

  server.listen(3030, function (err) {
    t.ifError(err, 'No error starting test API server')

    ghRequestAll({
      url: 'http://localhost:3030'
    }, {
      perPage: 1,
      onPage: function (results) {
        t.ok(results, 'A page was retrieved') // Should get 3 of these
      }
    }, function (err) {
      t.ifError(err, 'No error requesting all data')

      server.close(function (err) {
        t.ifError(err, 'No error stopping test API server')
        t.end()
      })
    })
  })
})

test('Should filter results', function (t) {
  t.plan(5)

  var data = ['foo', 'bar', 'baz']
  var server = createTestApiServer(data)

  server.listen(3030, function (err) {
    t.ifError(err, 'No error starting test API server')

    ghRequestAll({
      url: 'http://localhost:3030'
    }, {
      filter: function (item) { return item === 'foo' }
    }, function (err, results) {
      t.ifError(err, 'No error requesting all data')

      t.equal(results.length, 1)
      t.equal(results[0], 'foo')

      server.close(function (err) {
        t.ifError(err, 'No error stopping test API server')
        t.end()
      })
    })
  })
})
