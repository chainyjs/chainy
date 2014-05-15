(function(){
	// Import
	var expect = require('chai').expect,
		joe = require('joe')

	// Test Chainy
	joe.describe('chainy', function(describe,it){
		var Chainy = require('../').extend()
		
		it("should handle errors gracefully", function(next){
			Chainy.create()
				.addExtension('oops', 'action', function(){
					throw new Error('deliberate failure')
				})
				.oops()
				.done(function(err, chainData){
					expect(err.message).to.eql('deliberate failure')
					expect(chainData).to.eql(null)
					return next()
				})
		})
	});

	// Test Plugins
	['set', 'hasfield', 'map', 'exec', 'uniq'].forEach(function(value){
		require('./plugins/'+value+'-test')
	})
})()
