module.exports = (field) ->
	@data = @data.filter (item) ->
		return item[field]
	@