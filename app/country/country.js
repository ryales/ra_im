angular.module('ra_im').directive('countryView', function(){
		return {
			restrict:'E',
			templateUrl: 'app/country/country.html'
		};
	})
	.controller('countryController',['$http','$q','$scope','$rootScope','countryService',function($http,$q,$scope,$rootScope,countryService){

		var self = this;
		this.ISO3 = '';
		this.countryName = '';
		this.NS = '';
		this.expenditure = '';
		this.income = '';
		this.staff = '';
		this.vols = '';
		this.incomeGroup = '';
		this.population = '';
		this.gdp = '';
		this.hdi = '';
		this.lifeexpectancy = '';
		this.infantMortality = '';
		this.map = '';
		this.branchesOverlay = '';
		this.appeals = [];
		this.inform = {};
		this.inform.risk = '';
		this.inform.rank = '';
		this.inform.coping = '';
		this.inform.hazard = '';
		this.inform.vulnerability = '';

		$scope.$on('loadCountry', function(event, args) {
			self.ISO3 = $scope.inFocusCountry;

			this.countryPromise = countryService.getCountryData(self.ISO3);
			this.NSPromise = countryService.getNSData(self.ISO3);
			this.branchPromise = countryService.getBranchData(self.ISO3);
			this.appealsPromise = countryService.getAppealsData(self.ISO3);
			this.informPromise = countryService.getInformData(self.ISO3);

			$q.all([this.countryPromise,this.NSPromise,this.branchPromise,this.appealsPromise,this.informPromise]).then(function(results){
				if(results[0].length>0){
					self.countryName = results[0][0]['#country+name'];
					self.incomeGroup = results[0][0]['#indicator+income'];
					self.population = results[0][0]['#population'];
					self.gdp = results[0][0]['#indicator+gdp'];
					self.hdi = results[0][0]['#indicator+hdi'];
					self.lifeexpectancy = results[0][0]['#indicator+lifeexpectancy'];
					self.infantMortality = results[0][0]['#indicator+infantmortality'];
				}
				if(results[1].length>0){
					self.NS = results[1][0]['#org'];
					self.expenditure = results[1][0]['#indicator+expenditure'];
					self.income = results[1][0]['#indicator+income'];
					self.staff = results[1][0]['#indicator+staff'];
					self.vols = results[1][0]['#indicator+volunteers'];
				}
				if(results[4].length>0){
					self.inform.risk = results[4][0]['#indicator+risk'];
					self.inform.rank = results[4][0]['#indicator+rank'];
					self.inform.coping = results[4][0]['#indicator+coping'];
					self.inform.hazard = results[4][0]['#indicator+hazard'];
					self.inform.vulnerability = results[4][0]['#indicator+vulnerability'];
				}
				if(results[2].length>0){
					self.createBranchLayer(results[2]);
				}
				if(results[3].length>0){
					self.appeals = results[3];
					self.appeals.forEach(function(d){
						d['#meta+budget'] = +d['#meta+budget'];
						d['#meta+budget+formatted'] = d3.format(".3s")(d['#meta+budget']);
						d['#date+start+js'] = d3.time.format('%d/%m/%Y').parse(d['#date+start']);
					});
				}
				$rootScope.$broadcast('endloading');
			});
		});

		// Building the branches map layer
		this.createBranchLayer = function(data){

			// Construct the markers array
			var markers = [];

			// Cycle through the data and do various things with it depending on criteria
		    data.forEach(function(d){
		    	// Check lat/long and only grab the data rows with valid coordinates
		    	if(!isNaN(d['#geo+lat']) && d['#geo+lat']!='' && !isNaN(d['#geo+lon']) && d['#geo+lon']!=''){
		    		// Style the NS headquarters
		    		if(d['#loc+branch+code+type'] == '1'){
		    			radius = 6;
		    			opacity = 0.8;
		    		} else {
		    			radius = 4
		    			opacity = 0.6;
		    		}

		    		// Set the base style for each data feature
			        var marker = L.circleMarker([d['#geo+lat'], d['#geo+lon']],{
			            radius: radius,
			            fillColor: "#B71C1C",
			            color: "#B71C1C",
			            weight:0,
			            opacity: opacity,
			            fillOpacity: opacity,
			        });

			        // Define the popup on click for each feature
			        var popup = '<div class="popup">'+
									'<h2><b>'+d['#loc+branch+name']+'</b></h2>'+
			        		'<p>Location: <span style="float:right">'+d['#loc+city']+'</span><br/>'+
			        		'Branch type: <span style="float:right">'+d['#loc+branch+type']+'</span></p>'+
			        		'<h2><b>CONTACT INFORMATION</b></h2>'+
			        		'<p>Address: <span style="float:right">'+d['#loc+address+branch']+'</span><br/>'+
			        		'Telephone: <span style="float:right">'+d['#org+telephone']+'</span></p></div>';

							// Bind data to the markers
			       	marker.bindPopup(popup);
							// Push markers data and properties to the markers array
			        markers.push(marker);
			    }

		    });

		    // Add the data features to the map
		    this.branchesOverlay = new L.featureGroup(markers).addTo(this.map);

		    // Fit the bounds of the map view to the NS branch data
		    this.map.fitBounds(this.branchesOverlay.getBounds());
		}

		// Function for initializing the NS centered basemap
		this.init = function(){
			// Set basemap tile layer
			var basemap = new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
			});
			// Center the map and load the basemap tile layer
			this.map = L.map('countrymap',{
				center: [0,0],
		        zoom: 1,
		        layers: [basemap]
			});

		};

		// Calls the initialize function based off the NS selected
		this.init()

	}]);
