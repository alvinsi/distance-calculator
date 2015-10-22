var autocompleteFrom, autocompleteTo, estDist, estTime, directionsService, origin, destination;
var dayTotal = 0;
var hourTotal = 0;
var minTotal = 0;

/**
 * Loading Module Dependencies
 */
var distCalcApp = angular.module('distCalculator', ['ngMessages', 'ngResource']);

/**
 * Dependency Injection
 */
distCalcApp.controller('mainController', ['$scope', '$http', function($scope, $http) {
	$scope.estDist = "";
	$scope.estTime = "";

	$scope.calculate = function() {
		var request = {
			origin: origin,
			destination: destination,
			provideRouteAlternatives: true,
			travelMode: google.maps.TravelMode.DRIVING
		};

		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				$scope.$apply(function() {
					estimateResult(response, function() {
						$scope.estDist = estDist;
						$scope.estTime = estTime;
					});
				});
			}
		});
	};
}]);

/**
 * Initialize Autocomplete
 */
function initAutocomplete() {
	autocompleteFrom = new google.maps.places.Autocomplete((document.getElementById('autocompleteFrom')), {
		types: ['geocode']
	});
	autocompleteTo = new google.maps.places.Autocomplete((document.getElementById('autocompleteTo')), {
		types: ['geocode']
	});
	autocompleteFrom.addListener('place_changed', fillInFrom);
	autocompleteTo.addListener('place_changed', fillInTo);

	// Direction Service
	directionsService = new google.maps.DirectionsService();
}

/**
 * Autocomplete for Source
 */
function fillInFrom() {
	var place = autocompleteFrom.getPlace();
	if (!place.geometry) {
		window.alert("Autocomplete's returned place contains no geometry");
		return;
	} else {
		origin = place.geometry.location;
	}
}

/**
 * Autocomplete for Destination
 */
function fillInTo() {
	var place = autocompleteTo.getPlace();
	if (!place.geometry) {
		window.alert("Autocomplete's returned place contains no geometry");
		return;
	} else {
		destination = place.geometry.location;
	}
}

/**
 * Estimate Distance and Duration of Travel
 */
function estimateResult(result, callback) {
	if (result.routes.length % 2 == 0) {
		// Take Average
		if (result.routes.length == 0) {
			alert("No Route Found");
		} else {
			var totalDist = 0;

			dayTotal = 0;
			hourTotal = 0;
			minTotal = 0;

			for (var i = 0; i < result.routes.length; i++) {
				var tempDist = result.routes[i].legs[0].distance.text;
				totalDist += parseFloat(tempDist.replace(",", ""));

				var tempTime = result.routes[i].legs[0].duration.text;
				calculateTime(tempTime);
			}

			estDist = (totalDist / result.routes.length) + " mi";

			if (dayTotal > 0) {
				estTime = dayTotal / result.routes.length + " days ";
				if (hourTotal > 0) {
					estTime += hourTotal / result.routes.length + " hours ";
					if (minTotal > 0) {
						estTime += minTotal / result.routes.length + " mins";
					}
				} else if (minTotal > 0) {
					estTime += minTotal / result.routes.length + " mins";
				}
			} else if (hourTotal > 0) {
				estTime = hourTotal / result.routes.length + " hours ";
				if (minTotal > 0) {
					estTime += minTotal / result.routes.length + " mins";
				}
			} else {
				estTime = minTotal / result.routes.length + " mins";
			}
		}
	} else if (result.routes.length % 2 == 1) {
		// Take Middle Value
		if (result.routes.length == 1) {
			estDist = result.routes[0].legs[0].distance.text;
			estTime = result.routes[0].legs[0].duration.text;
		} else {
			var idx = Math.floor(result.routes.length / 2);
			estDist = result.routes[idx].legs[0].distance.text;
			estTime = result.routes[idx].legs[0].duration.text;
		}
	}
	return callback();
}

/**
 * Sums the Time to the Current Total
 */
function calculateTime(testTime) {
	var dayIndex = testTime.indexOf("day");
	var hourIndex = testTime.indexOf("hour");
	var minIndex = testTime.indexOf("min");

	if (dayIndex !== -1) {
		dayTotal += parseFloat(testTime);
		if (hourIndex !== -1) {
			hourTotal += parseFloat(testTime.substring(dayIndex + 4, testTime.length));
			if (minIndex !== -1) {
				minTotal += parseFloat(testTime.substring(hourIndex + 5, testTime.length));
			};
		} else if (minIndex !== -1) {
			minTotal += parseFloat(testTime.substring(dayIndex + 4, testTime.length));
		}
	} else if (hourIndex !== -1) {
		hourTotal += parseFloat(testTime);
		if (minIndex !== -1) {
			minTotal += parseFloat(testTime.substring(hourIndex + 5, testTime.length));
		}
	} else {
		minTotal += parseFloat(testTime);
	}
}