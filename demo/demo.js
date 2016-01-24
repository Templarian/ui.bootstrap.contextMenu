// Demo App
angular.module('app', ['ui.bootstrap.contextMenu'])

    .controller('DemoController', [
        '$scope',
        function ($scope) {
            $scope.player = {
                gold: 100
            };
            $scope.items = [
                { name: 'Small Health Potion', cost: 4 },
                { name: 'Small Mana Potion', cost: 5 },
                { name: 'Iron Short Sword', cost: 12 }
            ];
            $scope.menuOptions = [
                ['Buy', function ($itemScope) {
                    $scope.player.gold -= $itemScope.item.cost;
                }],
                null,
                ['Sell', function ($itemScope) {
                    $scope.player.gold += $itemScope.item.cost;
                }, function ($itemScope) {
                    return $itemScope.item.name.match(/Iron/) == null;
                }],
                null,
                ['More...', [
                    ['Alert Cost', function ($itemScope) {
                        alert($itemScope.item.cost);
                    }],
                    ['Alert Player Gold', function ($itemScope) {
                        alert($scope.player.gold);
                    }]
                ]]
            ];

            $scope.otherMenuOptions = [
                ['Favorite Color', function ($itemScope, $event, color) {
                    alert(color);
                }
                ]
            ];

            $scope.customHTMLOptions = [
                ['Example 1', function ($itemScope, $event, value) {
                    console.log("sdfsdfs", value);
                }
                ]
            ];




        }
    ]);