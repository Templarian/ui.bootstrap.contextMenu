#contextMenu

A AngularJS UI Bootstrap Module for adding context menus to items.

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
    { name 

$scope.menuOptions = [
    ['Select', function ($itemScope) {
        $scope.selected = $itemScope.
    }],
    null, // Dividier
    ['Remove', function ($itemScope) {
        window.location = '/api/download/icon/png/' + $itemScope.icon.id + '/36';
    }]
];
```
