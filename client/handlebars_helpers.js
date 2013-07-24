// Helper for formatting amounts (e.g., '10.00 SGD')
Handlebars.registerHelper('formatAmount', function (amount, currency) {
	return amount.toFixed(2) + ' ' + currency
})

// Helper for formatting dates
Handlebars.registerHelper('formatDate', function (format, date) {
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
		case 'DATE_MONTH_YEAR':
			return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear()

		case 'MONTH_YEAR':
			return months[date.getMonth()] + ' ' + date.getFullYear()

		case 'DAY':
			return days[date.getDay()]

		case 'DATE':
			return date.getDate()

		case 'INPUT_DATE':
			return date.toISOString().split('T')[0]
	}
})