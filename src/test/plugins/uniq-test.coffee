# Import
{expect} = require('chai')
joe = require('joe')
Chainy = require('../../../').extend().require(['set', 'uniq', 'done'])

# Task
joe.describe 'uniq plugin', (describe,it) ->
	it "should work without arguments", (next) ->
		Chainy.create()
			.set([1, 1, 2, 3])
			.uniq()
			.done (err, result) ->
				return next(err)  if err
				expect(result).to.deep.equal([1, 2, 3])
				return next()

	it "should work with a field argument", (next) ->
		Chainy.create()
			.set([{id:1}, {id:1}, {id:2}])
			.uniq('id')
			.done (err, result) ->
				return next(err)  if err
				expect(result).to.deep.equal([{id:1}, {id:2}])
				return next()
