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
				Chainy.addExtension('test', 'action', function(){})
			}
			catch (_err) {
				err = _err;
			}
			expect(err && err.message).to.contain('frozen')
		})

		it("should pass when attempting to extend a child class", function(){
			var extension = function(){}
			var MyChainy = Chainy.subclass().addExtension('test', 'utility', extension)
			expect(MyChainy.prototype.test).to.eql(extension)
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

		it("should inherit parent plugins", function(next){
			var top = Chainy.subclass()
				.addExtension('set', 'action', function(data){
					this.data = data
				})
			var parent = top.create()
				.addExtension('capitalize', 'action', function(){
					this.data = String(this.data).toUpperCase()
				})
			var child = parent.create()
				.set('some data')
				.capitalize()
				.done(function(err, chainData){
					expect(child.parent, "child parent is the parent chain instance").to.eql(parent)
					expect(parent.parent, "parent parent doens't exist").to.eql(null)
					//expect(child.klass, "child klass is the subclass").to.eql(top)
					//expect(parent.klass, "parent klass is the subclass").to.eql(top)
					expect(err).to.eql(null)
					expect(chainData, 'callback data is this.data').to.eql(this.data)
					expect(chainData, 'data is correct').to.eql('SOME DATA')
					return next()
				})
		})
	});
})()