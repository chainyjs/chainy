(function(){
	"use strict";

	// Import
	var expect = require('chai').expect,
		joe = require('joe')

	// Test Chainy
	joe.describe('chainy', function(describe,it){
		var Chainy = require('../')

		it("should fail when attempting to extend the base class", function(){
			var err;
			try {
				Chainy.addExtension('oops', 'action', function(){
					throw new Error('deliberate failure')
				})
			}
			catch (_err) {
				err = _err;
			}
			expect(err && err.message).to.contain('frozen')
		})

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

		it("should work well", function(next){
			Chainy.create()
				.addExtension('set', 'action', function(data){
					this.data = data
				})
				.set('some data')
				.done(function(err, chainData){
					expect(err).to.eql(null)
					expect(chainData).to.eql('some data')
					expect(chainData).to.eql(this.data)
					return next()
				})
		})
	});
})()