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

// Return all data for the current user
Template.details.expenditures = function () {
	return Expenditures.find({}, { sort: { date: -1 } }).fetch()
}

// Helper for formatting dates
Template.details.formatDate = function (format, date) {
	var months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	]

	var days = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday'
	]

	switch (format) {
		case 'MONTH_YEAR':
			return months[date.getMonth()] + ' ' + date.getFullYear()

		case 'DAY':
			return days[date.getDay()]

		case 'DATE':
			return date.getDate()
	}
}

// Helper for formatting amounts (e.g., '10.00 SGD')
Template.details.formatAmount = function (amount, currency) {
	return amount.toFixed(2) + ' ' + currency
}

// Return the total amount for an array of expenditures
Template.details.totalAmount = function (data) {
	return _.reduce(data, function (memo, item) {
		return memo + item.value
	}, 0)
}

// Group expenditure data by month
// Returns an array of objects having a 'date' and a list of expenditures
// for that month
Template.details.groupByMonth = function (context, options) {
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