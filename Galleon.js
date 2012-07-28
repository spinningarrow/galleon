Galleon = new Meteor.Collection('expensive_data');

if (Meteor.is_client) {

	Meteor.startup(function () {
		$('.container').hide().eq(0).show();
	});

	var toggleContainersHandler = function (event) {

		event.preventDefault();

		var toggleElementID = '#' + $(event.target).data('toggle');

		$(event.target).parents('.container').slideUp();
		$(toggleElementID).slideDown();
	};

	var listTags = function () {
		var tags = [];

		Galleon.find().forEach(function (data) {
			$.each(data.tags, function (index, value) {
				($.inArray(value, tags) === -1) && tags.push(value);
			});
		})

		return tags.sort();
	};

	// ---- Main (home) Page ----
	Template.main.events = {

		'click .container-toggle': toggleContainersHandler,

		'click .submit': function (event) {

			if ($('#amount').val() && $('#tags').val()) {

				var data = {
					date: $('#date').val() ? new Date($('#date').val()) : new Date(),
					amount: parseFloat($('#amount').val()),
					tags: $('#tags').val().split(' '),
				};

				Galleon.insert(data);

				$('#amount').val('');
				$('#tags').val('');
			}

			else {
				if (!$('#amount').val()) {
					$('#amount').focus();
				}
				else if (!$('#tags').val()) {
					$('#tags').focus();
				}
			}
		}
	};

	Template.main.date_today = function () {
		return new Date().toISOString().split("T")[0]; // looks hacky, but works so whatever
	};

	// Total (all time)
	Template.main.total = function () {

		var amounts = Galleon.find().map(function (data) {
			return data.amount;
		});

		return amounts.reduce(function (memo, num) { return memo + num }, 0).toFixed(2);
	};

	// Total (current month)
	Template.main.total_month = function () {

		var today = new Date(),
			current_year = today.getFullYear(),
			current_month = today.getMonth(),
			start_date = new Date(current_year, current_month, 1),
			end_date = new Date(current_year, current_month + 1, 1);

		var amounts = Galleon.find({ 'date': { $gte: start_date , $lt: end_date } })
						.map(function (data) { return data.amount; });

		return amounts.reduce(function (memo, num) { return memo + num }, 0).toFixed(2);
	};

	// Total (previous day)
	Template.main.total_yesterday = function () {

		var total = 0;

		Galleon.find(function () {
			return (new Date(this.date)).getDate() === (new Date()).getDate() - 1;
		}).forEach(function (data) {
			total += data.amount;
		});

		return total.toFixed(2);
	};

	// Total (today)
	Template.main.total_today = function () {

		var today = new Date(),

			current_year = today.getFullYear(),
			current_month = today.getMonth(),
			current_date = today.getDate(),

			start_date = new Date(current_year, current_month, current_date),
			end_date = new Date(current_year, current_month, current_date + 1),

			amounts = Galleon.find({ 'date': { $gte: start_date , $lt: end_date } })
						.map(function (data) { return data.amount; });

		return amounts.reduce(function (memo, num) { return memo + num }, 0).toFixed(2);
	};

	// ---- Details Page ----
	Template.view_details.events = {

		'click .container-toggle': toggleContainersHandler,

		'click .tag': function () {

			var id = $(event.target).parent('li').data('id'),
				document = Galleon.findOne({ _id: id }),
				tags = document.tags;

			var updated_tags = prompt('Enter updated tags (comma-separated) for \n$' + document.amount.toFixed(2) + ' spent on ' + new Date(document.date).toDateString() + ':', tags.join(', '));

			if (updated_tags != null) {

				updated_tags = updated_tags.split(/,\s/);

				if (!_.isEqual(updated_tags, tags)) { // is there a better way?
					Galleon.update({ _id: id }, { $set: { tags: updated_tags } });
				}
			}

			return false;
		},

		'click .day-title': function () {

			var $target = $(event.currentTarget);
			$target.toggleClass('collapsed').find('.items').slideToggle('fast');
		}
	};

	Template.view_details.grouped_data = function () {

		var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		var days = {
			mon: 'Monday',
			tue: 'Tuesday',
			wed: 'Wednesday',
			thu: 'Thursday',
			fri: 'Friday',
			sat: 'Saturday',
			sun: 'Sunday'
		};

		// Get all the data from the database
		var data = Galleon.find({}, {sort: {date: 1}}).fetch();

		// Add formatted amount to each data item
		_.each(data, function (item) {
			item.display_amount = item.amount.toFixed(2);
		});

		// Group by day
		var dates_group = _.groupBy(data, function (item) {
			return new Date(item.date).toDateString();
		});

		// Group into array for dates
		var daily_data = _.map(dates_group, function (value, key, list) {

			var date = new Date(key),
				day = days[key.match(/^\w{3}/)[0].toLowerCase()],
				month = months[date.getMonth()],
				date = date.getDate();

			return {
				day: key,
				display_day: day,
				display_month: month,
				display_date: date,
				total: _.reduce(value, function (memo, num) { return memo + num.amount; }, 0).toFixed(2),
				data: value
			}
		});

		// Group by month
		var months_group = _.groupBy(daily_data, function (item) {
			var date = new Date(item.day);
			return date.getMonth() + '/' + date.getFullYear();
		});

		// Group into array for months
		var monthly_data = _.map(months_group, function (value, key, list) {
			var matches = key.match(/(\d{1,2})\/(\d{4})/);
			return {
				month: months[parseInt(matches[1], 10)],
				year: parseInt(matches[2], 10),
				data: value,
				monthly_total: _.reduce(value, function (memo, num) { return memo + parseFloat(num.total); }, 0).toFixed(2)
			}
		});

		// Group by year
		var years_group = _.groupBy(monthly_data, function (item) {
			return item.year;
		});

		// Group into array for years
		var result = _.map(years_group, function (value, key, list) {
			return {
				year: key,
				data: value
			}
		});

		window.yd = result;

		return result;
	};
}

if (Meteor.is_server) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}