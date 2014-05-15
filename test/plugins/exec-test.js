(function(){
	// Import
	var expect = require('chai').expect,
		joe = require('joe')

	// Test
	joe.describe('exec plugin', function(describe,it){
		var Chainy = require('../../').extend().require(['exec', 'done'])
		
		it("should work", function(next){
			if ( process.env.TRAVIS ) {
				console.log('skipping for travis environment')
				return next()
			}

			Chainy.create()
				.exec('echo -n hello world')
				.done(function(err, result){
					if (err)  return next(err)
					expect(result).to.eql('hello world')
					return next()
				})
		})
	})
})()
