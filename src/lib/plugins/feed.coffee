feedr = require('feedr').create()
module.exports = (opts={}, next) ->
	me = @

	opts = {url: opts}  if typeof opts in ['string', 'function']
	opts.url = opts.url?(@data) or opts.url
	opts.cache ?= 'preferred'
	opts.parse ?= 'json'

	feedr.readFeed opts, (err, result) ->
		return next(err)  if err
		me.data = result
		return next()

	@
