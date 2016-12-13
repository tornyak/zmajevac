(function() {
    'use strict';

    angular.module('ZmajevacApp', [])
        .controller('WateringController', WateringController);

    WateringController.$inject = ['$scope', '$http'];

    function WateringController($scope, $http) {
        var data = {
            'arg': 'on',
            'access_token': ''
        }

        Object.toparams = function ObjecttoParams(obj) {
            var p = [];
            for (var key in obj) {
                p.push(key + '=' + encodeURIComponent(obj[key]));
            }
            return p.join('&');
        };
        $scope.wateringTime = new Date(1981, 8, 16, 1, 1, 1, 1);

        $scope.waterZmajevac = function() {
            $scope.wateringTime = new Date();

            var waterUrl = 'https://api.particle.io/v1/devices/430048001051353338363333/pumpchina';

            $http({
                method: 'POST',
                url: waterUrl,
                data: Object.toparams(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function(response) {
                console.log(response.data);
            });


        };
    }
})();
