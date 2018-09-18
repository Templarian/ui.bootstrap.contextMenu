# contextMenu

AngularJS UI Bootstrap Module for adding context menus to elements. [Demo](http://codepen.io/templarian/pen/VLKZLB)

- `npm install angular-bootstrap-contextmenu` or
- `bower install angular-bootstrap-contextmenu`



[![Example](http://i.imgur.com/U3xybfE.png)](http://codepen.io/templarian/pen/VLKZLB)

## Usage

Add a reference to `contextMenu.js`. In your app config add `ui.bootstrap.contextMenu` as a dependency module.

## Context Menu Settings
- `context-menu-on` - (Default: 'contextmenu') A comma-separated string literal containing the events that will trigger the context menu to appear.
- `context-menu-empty-text` - (Default: 'empty') An angular expression containing the string to be used when the context menu is empty
- `context-menu-class` - A string literal containing a custom class to be added to the context menu (The &lt;ul&gt; elements)
- `allow-event-propagation` - (Default: false) A boolean determining whether to allow event propagation. Note that if you set this to true, and don’t catch it with something else the browser’s context menu will be shown on top of this library’s context menu.
- `model` - (See Model Attribute below)
- `close-menu-on` - (Default: '') A string literal containing event for triggering menu close action.

### View

```html
<div>
    <div ng-repeat="item in items" context-menu="menuOptions">Right Click: {{item.name}}</div>
</div>
<div ng-bind="selected"></div>
```
* OR

```html
<div>
    <span>you can specify the event on how the menu opens:</span>
    <div ng-repeat="item in items" context-menu="menuOptions" context-menu-on="click">Left Click: {{item.name}}</div>
</div>
<div ng-bind="selected"></div>
```
### Callback Parameters

There are currently 5 parameters that are being passed to the callback:
- `$itemScope` - The scope of the directive
- `event` - The event associated with this directive (normally `contextmenu`)
- `modelValue` - See "Model Attribute" below
- `text` - The HTML value of the text. Normally this contains the &lt;a&gt; tag surrounding the text by default.
- `$li` - The list item selected

### Controller

```js
$scope.selected = 'None';
$scope.items = [
    { name: 'John', otherProperty: 'Foo' },
    { name: 'Joe', otherProperty: 'Bar' }
];

$scope.menuOptions = [
    // NEW IMPLEMENTATION
    {
        text: 'Object-Select',
        click: function ($itemScope, $event, modelValue, text, $li) {
            $scope.selected = $itemScope.item.name;
        }
    },
    {
        text: 'Object-Remove',
        click: function ($itemScope, $event, modelValue, text, $li) {
            $scope.items.splice($itemScope.$index, 1);
        }
    },
    // LEGACY IMPLEMENTATION
    ['Select', function ($itemScope, $event, modelValue, text, $li) {
        $scope.selected = $itemScope.item.name;
    }],
    null, // Dividier
    ['Remove', function ($itemScope, $event, modelValue, text, $li) {
        $scope.items.splice($itemScope.$index, 1);
    }]
];
```

## Menu Options

The menu options passed onto context-menu can be one of:
- An Array containing Objects to represent each item in the context menu
- A Function returning an Array of Objects (as above)
- A Promise returning an Array of Objects or a Function (as above)

### New implementation
Every menu option is represented by an Object containing the following properties:

| Property | Type | Description |
| -------- | ---- | ----------- |
| text | Function/String | A function that returns the string or the actual string itself. Either text or html must be specified |
| html | Function/String | A function or string that returns the html to be used for this menu option. Either text or html must be specified |
| compile | Boolean | To compile html string to use a custom directive in the html string |
| click | Function | The function to be called on click of the option|
| enabled | Function/Boolean | A function returning whether the option is enabled or not, or a boolean |
| displayed | Function/Boolean | A function returning whether the option is displayed or not, or a boolean. If not displayed, no element is created at all and nothing related to the item will be executed (events, functions returning children, etc.) |
| children | Array/Function/Promise | [Array] - the actual Array of Objects for the level; [Function] - returns an Array of Objects, or a Function that returns the Array or a Promise as specified below; [Promise] - resolves with an Array or a Function that returns the Array as specified above |
| hasTopDivider | Function/Boolean | A function/boolean returning whether to append a divider before the current item. Defaults to false |
| hasBottomDivider | Function/Boolean | A function/boolean returning whether to append a divider after the current item. Defaults to false |

### Legacy implementation (still supported, but will not be updated any longer)
Every menu option has an array with 2-3 indexs. Most items will use the `[String, Function]` format. If you need a dynamic item in your context menu you can also use the `[Function, Function]` format.

The third optional index is a function used to enable/disable the item. If the function returns true, the item is enabled (default). If no function is provided, the item will be enabled by default.

```js
$scope.menuOptions = [
    [function ($itemScope, $event, modelValue, text, $li) {
        return $itemScope.item.name;
    }, function ($itemScope, $event) {
        // Action
    }, function($itemScope, $event, modelValue, text, $li) {
        // Enable or Disable
        return true; // enabled = true, disabled = false
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
        [function ($itemScope) {
            return $itemScope.item.name;
        }, function ($itemScope) {
            // Action
        }]
    ];
};
```

## Events
There are some events you can listen to whenever the context menu is opening or closing
- `context-menu-opening` - triggers right before the context menu is initially opened
- `context-menu-opened` - triggers whenever any context menu is completely opened
- `context-menu-closed` - triggers whenever any context menu is closed
- `context-menu-all-closed` - triggers when all context menus are closed

### Sample usage
```js
$scope.$on('<event_name_here>', function (event, args) {
  args.context; // The element this directive is attached to
  args.params; // Available only for context-menu-opened the params passed for the context menu
  args.contextMenu; // Available only for context-menu-opened and context-menu-closed. The $ul element of this context menu.
})
```

## Model Attribute (optional)

In instances where a reference is not passed through the `$itemScope` (i.e. not using `ngRepeat`), there is a `model` attribute that can pass a value.

```html
<div context-menu="menuOptions" model="expression">Some item name here</div>
```

The `model` is evaluated as an expression using `$scope.$eval` and passed as the third argument.

```js
$scope.menuOptions = [
    [function ($itemScope, $event, modelValue) {
        return $itemScope.item.name;
    }, function ($itemScope, $event, modelValue) {
        // Action
    }, function($itemScope, $event, modelValue) {
        // Enable or Disable
        return true; // enabled = true, disabled = false
    }]
];
```

## Style Overlay

The class `angular-bootstrap-contextmenu` is added to the `<div>` that this context-menu is attached to.

To give a light darker disabled tint while the menu is open add the style below.

```css
body > .angular-bootstrap-contextmenu.dropdown {
    background-color: rgba(0, 0, 0, 0.1);
}
```
