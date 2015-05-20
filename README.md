#contextMenu

AngularJS UI Bootstrap Module for adding context menus to elements. [Demo](http://jsfiddle.net/gcayszpq/)

`bower install angular-bootstrap-contextmenu`

[![Example](http://templarian.com/files/angularjs_contextmenu.png)](http://jsfiddle.net/gcayszpq/)

## Usage

Add a reference to `contextMenu.js`. In your app config add `ui.bootstrap.contextMenu` as a dependency module.

### View

```html
<div>
    <div ng-repeat="item in items" context-menu="menuOptions">Right Click: {{item.name}}</div>
</div>
<div ng-bind="selected"></div>
```

### Controller

```js
$scope.selected = 'None';
$scope.items = [
    { name: 'John', otherProperty: 'Foo' },
    { name: 'Joe', otherProperty: 'Bar' }
};

$scope.menuOptions = [
    ['Select', function ($itemScope) {
        $scope.selected = $itemScope.item.name;
    }],
    null, // Dividier
    ['Remove', function ($itemScope) {
        $scope.items.splice($itemScope.$index, 1);
    }]
];
```

## Menu Options

Every menu option has an array with 2-3 indexs. Most items will use the `[String, Function]` format. If you need a dynamic item in your context menu you can also use the `[Function, Function]` format.
The third item is a function used to enable/disable the item. If the functtion returns true, the item is enabled (default). If no function is provided, the item will be enabled by default. 

```js
$scope.menuOptions = [
    [function ($itemScope) { return $itemScope.item.name; }, function ($itemScope) {
        // Code
    }, function($itemScope, $event, text) {
        // Enable/disable code (text will be the return of the first function or String)
        return true;//enabled
    }]
];
```

The menuOptions can also be defined as a function returning an array. An empty array will not display a context menu.

```html
<div ng-repeat="item in items" context-menu="menuOptions(item)">Right Click: {{item.name}}</div>
```

```js
$scope.menuOptions = function (item) {
    if (item.name == 'John') { return []; }
    return [
        [function ($itemScope) { return $itemScope.item.name; }, function ($itemScope) {
            // Code
        }]
    ];
};
```

## Tag option

If you need another reference to the item (or your context is not inside a ngRepeat), there is a tag attribute you can use.

```html
<div context-menu="menuOptions" context-menu-tag="expression">Some item name here</div>
```

The tag is evaluated as an expression using ```$scope.$eval``` and passed to all 3 functions as the last argument:

```js
$scope.menuOptions = [
    [function ($itemScope, $event, $tag) { return $itemScope.item.name; }, function ($itemScope, $event, $tag) {
        // Code
    }, function($itemScope, $event, text, $tag) {
        // Enable/disable code (text will be the return of the first function or String)
        return true;//enabled
    }]
];
```

## Style Overlay

To give a light darker disabled tint while the menu is open add the style below.

```css
body > .dropdown {
    background-color: rgba(0, 0, 0, 0.1);
}
```

## Limitations (work in progress)

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
        }]
    ]
];
```
