//--------------------------------------------------------------------
// Template: Create
//--------------------------------------------------------------------

Template.create.todayDate = function () {
	return new Date().toISOString().split("T")[0]; // looks hacky, but works so whatever
}

Template.create.events({

	'submit #form-create': function (event, template) {

		var value = template.find('#amount').value
		var tags = template.find('#tags').value
		var date = template.find('#date').value

		if (value && tags) {

			date = (date ? new Date(date) : new Date()).toISOString()
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

Template.details.data = function () {
	return Expenditures.find({}, { sort: { date: -1 } }).fetch()
}