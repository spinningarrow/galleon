Meteor.subscribe('expenditures')

//--------------------------------------------------------------------
// Template: Create
//--------------------------------------------------------------------

Template.create.todayDate = function () {
	return new Date().toISOString().split("T")[0]; // looks hacky, but works so whatever
}

Template.create.events({

	'submit #form-create': function (event, template) {

		var value = +template.find('#amount').value
		var tags = template.find('#tags').value
		var date = template.find('#date').value

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
				currency: 'SGD',
				tags: tags
			}/*, function (error, expenditure) {

				if (!error) {
					// Session.set('lastDate', date)
				}
			}*/)

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

// Date helper
Template.details.formatDate = function (date) {
	return new Date(date)/*.toDateString()*/;
}

Template.details.formatAmount = function (amount, currency) {
	return amount.toFixed(2) + ' ' + currency
}

Template.details.dataByMonth = function (context, options) {
	// context - array of all expenditure data

	var ret = ''
	var result = []

	var groupedData = _.groupBy(context, function (item) {
		return item.date.getFullYear() + '-' + (item.date.getMonth() + 1)
	})

	_.each(groupedData, function (value, key) {
		result.push({
			date: new Date(key),
			expenditures: value
		})
	})

	_.each(result, function (element) {
		ret = ret + options.fn(element)
	})

	return ret
}

Template.details.dataByDay = function (context, options) {
	// context - array of expenditure data (could be all exp, exp for a month, etc)

	var ret = ''
	var result = []

	var groupedData = _.groupBy(context, function (item) {
		return item.date.toDateString()
	})

	_.each(groupedData, function (value, key) {
		result.push({
			date: new Date(key),
			expenditures: value
		})
	})

	_.each(result, function (element) {
		ret = ret + options.fn(element)
	})

	return ret
}

Template.details.data = function () {
	return Expenditures.find({}, { sort: { date: -1 } }).fetch()
}