module.exports = (opts={}, next) ->
	if typeof opts in ['function','string']
		opts = {url:opts}
	opts.cache = 'preferred'

	me = @
	feedr = require('feedr').create(opts)

	@fork()
		.map (item, complete) ->
			url = opts.url?(item) or opts.url
			feedr.readFeed({url, parse:'json'}, complete)
		.task (result) ->
			me.data = result
			next()

	@