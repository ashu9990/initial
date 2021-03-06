(function() {
    'use strict';
    /* jshint -W098 */
    angular.module('mean.role').controller('FeatureController', FeatureController);
    FeatureController.$inject = ['$scope', '$stateParams','ROLE', '$location', 'FeatureService','Upload','$timeout'];
    function FeatureController($scope, $stateParams, ROLE, $location, FeatureService, Upload, $timeout) {
	    $scope.package = {
	        name: 'role',
	        feature: 'Features'
	    };
	    $scope.isFeatureCategory = true;
		$scope.newFeature = function () {
	        $location.path(ROLE.PATH.CREATE_FEATURE);
	    };

	    $scope.editFeature = function (featureId) {
            var urlPath = ROLE.PATH.EDIT_FEATURE;
            urlPath = urlPath.replace(':featureId', featureId);
            $location.path(urlPath);
        };

        $scope.featureShow = function(featureId) {
            var urlPath = ROLE.PATH.SHOW_FEATURE;
            urlPath = urlPath.replace(':featureId', featureId);
            $location.path(urlPath);
        };

	    $scope.create = function (isValid) {
	        if (isValid) {
	            var feature = new FeatureService.createFeature($scope.feature);
	            feature.$save(function (response) {
	                $location.path(ROLE.PATH.LIST_FEATURE);
	            }, function (error) {
	                $scope.error = error;
	            });
	        } else {
	            $scope.submitted = true;
	        }
	    };

	    $scope.destroy = function (Feature) {
	    	if (Feature){
	            Feature.$remove(function (response) {
	                for (var i in $scope.features) {
                        if ($scope.features[i] === Feature) {
                            $scope.features.splice(i, 1);
                        }
                    }
	                $location.path(ROLE.PATH.LIST_FEATURE);
	            });
	        } else {
	            $scope.features.$remove(function (response) {
                    $location.path(ROLE.PATH.LIST_FEATURE);
                });
	        }
	    };

	    $scope.update = function (isValid) {
	        if (isValid) {
	            var feature = new FeatureService.feature($scope.feature);
	            if (!feature.updated) {
	                feature.updated = [];
	            }
	            feature.updated.push(new Date().getTime());
	            feature.$update({featureId: $stateParams.featureId}, function () {
	                $location.path(ROLE.PATH.LIST_FEATURE);
	            }, function (error) {
                    $scope.error = error;
                });
	        } else {
	            $scope.submitted = true;
	        }
	    };

	    $scope.findAll = function () {
            FeatureService.feature.query(function (features) {
                $scope.features = features;
                var featureCategories = [];
                for (var i=0;i<features.length;i++){
                	if (features[i].ismenuItem === true){
                		featureCategories.push(features[i]);
                	}
                }
                console.log(featureCategories);
                $scope.featureCategories = featureCategories;
            });
        };

	    $scope.findOne = function () {
	        FeatureService.feature.get({featureId: $stateParams.featureId}, function (feature) {
	            $scope.feature = feature;
	        });
	    };

	    $scope.cancel = function () {
	        $location.path(ROLE.PATH.LIST_FEATURE);
	    };

	    $scope.featureCategory = function(){
	    	if ($scope.isFeatureCategory === true){
	    		$scope.isFeatureCategory = false;
	    	} else
	    	if ($scope.isFeatureCategory === false){
	    		$scope.isFeatureCategory = true;
	    	}

	    }

	    $scope.featureImage = function(image){
	    	if (angular.isArray(image)) {
                image = image[0];
            }

            // This is how I handle file types in client side
            if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
                console.log('Only PNG and JPEG are accepted.');
                return;
            }

            $scope.uploadInProgress = true;
            $scope.uploadProgress = 0;

            $scope.upload = Upload.upload({
                url: '/api/upload/image',
                method: 'POST',
                file: image
            }).progress(function(event) {
                $scope.uploadProgress = Math.floor(event.loaded / event.total);
                $timeout(function() {
                	$scope.$apply();
                }); 
            }).success(function(data, status, headers, config) {
            	if (!$scope.feature){
            		$scope.feature = {};
            	}
                $scope.uploadInProgress = false;
                // If you need uploaded file immediately 
                $scope.feature.image = data;
            }).error(function(err) {
                $scope.uploadInProgress = false;
                console.log('Error uploading file: ' + err.message || err);
            });
	    }
	}
})();