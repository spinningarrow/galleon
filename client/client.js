Meteor.subscribe('expenditures')

//--------------------------------------------------------------------
// Template: Index
//--------------------------------------------------------------------

// Temporary hack in place of actual router-based logic
Template.index.events({
	'click .show-create, click .site-title': function (event, template) {
		// These sections are only available to signed-in users
		if (!Meteor.user()) {
			return
		}

		template.find('.template-details').className += ' hidden'

		var templateCreateElement = template.find('.template-create')

		// Twirly 'removeClass' implementation
		templateCreateElement.className = _.without(templateCreateElement.className.split(' '), 'hidden').join(' ')
	},

	'click .show-details': function (event, template) {
		template.find('.template-create').className += ' hidden'

		var templateDetailsElement = template.find('.template-details')

		// Twirly 'removeClass' implementation
		templateDetailsElement.className = _.without(templateDetailsElement.className.split(' '), 'hidden').join(' ')
	}
})

//--------------------------------------------------------------------
// Template: Create
//--------------------------------------------------------------------

Template.create.todayDate = function () {
	return new Date().toISOString().split("T")[0]; // looks hacky, but works so whatever
}

Template.create.lastInsertedExpenditure = function () {
	return Session.get('lastInsertedExpenditure')
}

Template.create.events({

	'submit #form-create': function (event, template) {

		var amount = template.find('#amount').value.split(/\s+/)
		var tags = template.find('#tags').value
		var date = template.find('#date').value

		var value = +amount[0] || 0
		var currency = amount[1] && amount[1].length === 3 ? amount[1] : 'SGD'

		if (value && tags) {

			date = date ? new Date(date) : new Date()
			tags = tags.trim().split(/\s+/)

			// Reset values
			template.find('#amount').value = ''
			template.find('#tags').value = ''

			// Insert data
			Meteor.call('createExpenditure', {
				date: date,
				value: value,
				currency: currency.toUpperCase(),
				tags: tags
			}, function (error, insertedId) {
				if (!error) {
					Session.set('lastInsertedExpenditure', Expenditures.findOne({
						_id: insertedId
					}))

					// Remove after 10 seconds
					window.setTimeout(function () {
						if (Session.get('lastInsertedExpenditure')._id === insertedId) {
							Session.set('lastInsertedExpenditure', null)
						}
					}, 10000)
				}/* else {
					Session.set('lastInsertedExpenditure', 'An error occurred.')
				}*/
			})
		}

		/*else {
			if (!amountVal) {
				$amount.focus();
			}
			else if (!$tags.val()) {
				$tags.focus();
			}
		}*/

		// Don't reload page
		return false
	}
})

//--------------------------------------------------------------------
// Template: Details
//--------------------------------------------------------------------

// Return all data for the current user
Template.details.expenditures = function () {
	return Expenditures.find({}, { sort: { date: -1 } }).fetch()
}

// Return the total amount for an array of expenditures
// TODO check currency of data objects
Template.details.totalAmount = function (data) {
	return _.reduce(data, function (memo, item) {
		return memo + item.value
	}, 0).toFixed(2)
}

Template.details.tagsWithCount = function () {

	// TODO Use data passed in!!!!
	var data = Expenditures.find().fetch()

	var objectResult = _.countBy(_.flatten(_.map(data, function (item) {
		return item.tags
	})))

	// Easy solution that doesn't work with Meteor's current Handlebars
	// return objectResult

	var result = []

	_.each(objectResult, function (value, key) {
		result.push({
			name: key,
			count: value
		})
	})

	return result
}

// Returns data that matches a list of tags
Template.details.findByTag = function (tags, data) {

	// Convert tags string to array
	tags = tags && tags.trim().split(/\s+/)

	// No tags specified, don't filter
	if (!tags || !tags.length) {
		return data
	}

	return _.filter(data, function (item) {
		return _.intersection(item.tags, tags).length
	})
}

// Group expenditure data by month
// Returns an array of objects having a 'date' and a list of expenditures
// for that month
Template.details.groupByMonth = function (context, options) {

	// Fix for bug that was causing groupByMonth to be called with context
	// as an object with a 'hash' property when the tag search input box is
	// cleared (looks like this function is called every time the search input
	// changes once before going into findByTag [causing the error] and once
	// after)
	if (!_.isArray(context)) {
		return ''
	}

	var ret = ''
	var result = []

	var groupedData = _.groupBy(context, function (item) {
		return item.date.getFullYear() + '-' + (item.date.getMonth() + 1)
	})

	_.each(groupedData, function (value, key) {
		result.push({
			date: new Date(key),
			monthlyExpenditures: value
		})
	})

	_.each(result, function (element) {
		ret = ret + options.fn(element)
	})

	return ret
}

// Group expenditure data by day
// Returns an array of objects having a 'date' and a list of expenditures
// for that day
Template.details.groupByDay = function (context, options) {
	var ret = ''
	var result = []

	var groupedData = _.groupBy(context, function (item) {
		return item.date.toDateString()
	})

	_.each(groupedData, function (value, key) {
		result.push({
			date: new Date(key),
			dailyExpenditures: value
		})
	})

	_.each(result, function (element) {
		ret = ret + options.fn(element)
	})

	return ret
}

// Tag search asfh
Template.details.tagSearchQuery = function () {
	return Session.get('tagSearchQuery')
}

Template.details.events({

	'keyup #tag-search': function (event, template) {
		Session.set('tagSearchQuery', template.find('#tag-search').value)
	},

	'click .expenditure-date': function(event) {
		$(event.currentTarget).next('.expenditure-day-list')
			.toggleClass('hidden')
	},

	'click .expenditure-item-display': function (event) {
		// Hide all open edit elements in the current day list
		// (doesn't look okay because consecutive open edit elements
		// overlap)
		$(event.currentTarget).parents('.expenditure-day-list')
			.find('.expenditure-item-display').removeClass('hidden').end()
			.find('.expenditure-item-edit').addClass('hidden')

		// Hide current display element
		$('#' + this._id + ' .expenditure-item-display').addClass('hidden')

		// Show current edit element
		$('#' + this._id + ' .expenditure-item-edit').removeClass('hidden')
	},

	'click .expenditure-item-delete': function () {
		confirm('Are you sure you want to delete this item (cannot be undone)?') &&	Expenditures.remove({ _id: this._id })

		return false
	},

	'reset .expenditure-item-edit-form': function (event, template) {
		var displayElement = template.find('#' + this._id + ' .expenditure-item-display')
		var editElement = template.find('#' + this._id + ' .expenditure-item-edit')

		editElement.className += ' hidden'

		// Twirly 'removeClass' implementation
		displayElement.className = _.without(displayElement.className.split(' '), 'hidden').join(' ')
	},

	'submit .expenditure-item-edit-form': function (event, template) {
		var displayElement = template.find('#' + this._id + ' .expenditure-item-display')
		var editElement = template.find('#' + this._id + ' .expenditure-item-edit')

		editElement.className += ' hidden'

		// Twirly 'removeClass' implementation
		displayElement.className = _.without(displayElement.className.split(' '), 'hidden').join(' ')

		// Get form values
		var date = template.find('#' + this._id + ' .expenditure-item-edit-date').value
		var value = +template.find('#' + this._id + ' .expenditure-item-edit-value').value || 0
		var tags = template.find('#' + this._id + ' .expenditure-item-edit-tags').value

		// if (value && tags) {

			date = date ? new Date(date) : new Date()
			tags = tags.trim().split(/\s+/)

			// Reset values
			// template.find('#amount').value = ''
			// template.find('#tags').value = ''

			// Update data
			Expenditures.update({ _id: this._id }, { $set: {
					date: date,
					value: value,
					tags: tags
				}
			})

		return false // don't actually submit the form
	}
})