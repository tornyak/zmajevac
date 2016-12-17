(function() {
    'use strict';

    angular.module('ZmajevacApp', [])
        .controller('WateringController', WateringController);

    WateringController.$inject = ['$scope', '$http', '$interval'];

    var token = '';

    function getHttpData(token, action) {
        var dataObject = {
            'arg': action,
            'access_token': token
        };
        return encodeToUriParams(dataObject);
    }

    function encodeToUriParams(obj) {
        var p = [];
        for (var key in obj) {
            p.push(key + '=' + encodeURIComponent(obj[key]));
        }
        return p.join('&');
    }

    function WateringController($scope, $http, $interval) {

        $scope.waterPumps = [];
        $scope.waterPumps.push({
            wateringTime: new Date(2016, 12, 19, 1, 1, 1, 1),
            watering: false,
            waterButtonLabel: "Water",
            wateringButtonClass: "btn-primary",
            wateringProgress: 0,
            url: 'https://api.particle.io/v1/devices/430048001051353338363333/pump',
            wateringInterval: 720 // 1% on progress bar
        });

        $scope.waterPumps.push({
            wateringTime: new Date(2016, 12, 19, 1, 1, 1, 1),
            watering: false,
            waterButtonLabel: "Water",
            wateringButtonClass: "btn-primary",
            wateringProgress: 0,
            url: 'https://api.particle.io/v1/devices/430048001051353338363333/pumpchina',
            wateringInterval: 360 // 1% on progress bar
        });

        $scope.waterZmajevac = function() {
            waterWithPump($scope.waterPumps[0]);
        };

        $scope.refillOscar = function() {
            waterWithPump($scope.waterPumps[1]);
        };

        function waterWithPump(pump) {
            if (pump.watering) {
                pumpOff(pump);
            } else {
                pumpOn(pump);
            }
        }

        function pumpOn(pump) {
            $http({
                method: 'POST',
                url: pump.url,
                data: getHttpData(token, "on"),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function(response) {
                console.log(response.data);
                if (response.data["connected"] === true ||
                    response.data["return_value"] === 0) {
                    startWatering(pump);
                } else {
                    wateringFailed(pump, "Could not start watering");
                }
            }, function(response) {
                wateringFailed(pump, "Could not start watering");
            });
        }

        function pumpOff(pump) {
            $http({
                method: 'POST',
                url: pump.url,
                data: getHttpData(token, "off"),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function(response) {
                console.log(response.data);
                if (response.data["connected"] === true ||
                    response.data["return_value"] === 0) {
                    stopWatering(pump);
                } else {
                    wateringFailed("Could not stop watering");
                }
            }, function(response) {
                wateringFailed(pump, "Could not start watering");
            });
        }

        function startWatering(pump) {
            resetWateringFailed(pump);
            pump.watering = true;
            pump.waterButtonLabel = "Stop Watering";
            pump.wateringButtonClass = "btn-warning"
            startWateringTimer(pump);
        };

        function startWateringTimer(pump) {
            // Don't start a new fight if we are already fighting
            if (angular.isDefined(pump.stop)) return;

            pump.stop = $interval(function() {
                if (pump.wateringProgress === 100) {
                    stopWatering(pump);
                } else {
                    pump.wateringProgress++;
                }
            }, pump.wateringInterval);
        };

        function stopWatering(pump) {
            if (angular.isDefined(pump.stop)) {
                $interval.cancel(pump.stop);
                pump.stop = undefined;
                pump.watering = false;
                pump.waterButtonLabel = "Water";
                pump.wateringButtonClass = "btn-primary"
                pump.wateringTime = new Date();
                pump.wateringProgress = 0;
            }
        };

        function wateringFailed(pump, msg) {
            pump.wateringFailed = true;
            pump.wateringErrorMsg = msg;
        }

        function resetWateringFailed(pump) {
            pump.wateringFailed = false;
            pump.wateringErrorMsg = "";
        };

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stopWateringTimer();
        });
    }
})();
