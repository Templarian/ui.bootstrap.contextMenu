#contextMenu

AngularJS UI Bootstrap Module for adding context menus to elements.

## Usage

Add a reference to `contextMenu.js`. In your app config add `ui.bootstrap.contextMenu` as a dependency module.

### View

```html
<div ng-repeat="item in items">
    <ANY context-menu="menuOptions">Right Click</ANY>
</div>
<div ng-bind="selected"></div>
```

### Controller

```js
$scope.items = [
    { name: 'John', otherProperty: 'Foo' },
    { name: 'Joe', otherProperty: 'Boo' }
};

$scope.menuOptions = [
    ['Select', function ($itemScope) {
        $scope.selected = $itemScope.
    }],
    null, // Dividier
    ['Remove', function ($itemScope) {
        $scope.items.slice($itemScope.$index, 1);
    }]
];
```

## Menu Options

Every menu option has an array with 2 indexs. Most items will use the `[String, Function]` format. If you need a dynamic item in your context menu you can also use the `[Function, Function]` format.

```js
$scope.menuOptions = [
    [function ($itemScope) { return $itemScope.name; }, function ($itemScope) {
        // Code
    }]
];
```

## Limitions (work in progress)

Nested lists are not supported yet, because I have not needed it yet. If you add it please do a pull request.

```JS
$scope.menuOptions = [
    ['Parent Item 1', function ($itemScope) {
        // Code
    },  ['Child Item 1', function ($itemScope) {
            // Code
        }],
        ['Child Item 2', function ($itemScope) {
            // Code
        }],
    ]
]
```
