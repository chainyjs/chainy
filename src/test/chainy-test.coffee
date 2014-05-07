# Import
{expect} = require('chai')
joe = require('joe')
Chainy = require('../../').extend()

# Chainy
joe.describe 'chainy', (describe,it) ->
	it "should handle errors gracefully", (next) ->
		Chainy.create()
			.addPlugin 'oops', ->
				throw new Error('deliberate failure')
			.oops()
			.done (err, chainData) ->
				expect(err.message).to.eql('deliberate failure')
				expect(chainData).to.eql(null)
				return next()

# Plugins
for pluginName in ['set', 'hasfield', 'map', 'exec', 'uniq']
	require('./plugins/'+pluginName+'-test')
