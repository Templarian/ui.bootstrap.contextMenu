(function($) {

angular.module('ui.bootstrap.contextMenu', [])

.service('CustomService', function () {
    "use strict";

    return {
        initialize: function (item) {
            console.log("got here", item);
        }
    };

})
.directive('contextMenu', ["$parse", "$q", "CustomService", "$sce", function ($parse, $q, custom, $sce) {

    var _contextMenus = [];
    var DEFAULT_ITEM_TEXT = "New Item";

    var processTextItem = function (params) {
        // Destructuring:
        var $scope = params.$scope;
        var item = params.item;
        var text = params.text;
        var event = params.event;
        var modelValue = params.modelValue;
        var $promises = params.$promises;
        var nestedMenu = params.nestedMenu;

        var textParam = item[0];

        var $a = $('<a>');
        $a.css("padding-right", "8px");
        $a.attr({ tabindex: '-1', href: '#' });

        if (typeof textParam === 'string') {
            text = textParam;
        }
        else if (typeof textParam === "function") {
            text = textParam.call($scope, $scope, event, modelValue);
        } else if (typeof item.text !== "undefined") {
            text = item.text;
        }

        var $promise = $q.when(text);
        $promises.push($promise);
        $promise.then(function (promisedText) {
            if (nestedMenu) {
                $a.css("cursor", "default");
                $a.append($('<strong style="font-family:monospace;font-weight:bold;float:right;">&gt;</strong>'));
            }
            $a.append(promisedText);
        });

        return $a;

    };

    /**
     * Process each individual item
     *
     * Properties of params:
     * - $scope
     * - event
     * - modelValue
     * - level
     * - item
     * - $ul
     * - $li
     * - $promises
     */
    var processItem = function (params) {
        // Destructuring:
        var item = params.item;
        var $ul = params.$ul;
        var $li = params.$li;
        var $scope = params.$scope;
        var modelValue = params.modelValue;
        var level = params.level;
        var event = params.event;
        var $promises = params.promises;

        // nestedMenu is either an Array or a Promise that will return that array.
        var nestedMenu = angular.isArray(item[1]) ||
            (item[1] && angular.isFunction(item[1].then)) ? item[1] : angular.isArray(item[2]) ||
            (item[2] && angular.isFunction(item[2].then)) ? item[2] : angular.isArray(item[3]) ||
            (item[3] && angular.isFunction(item[3].then)) ? item[3] : null;

        // if html property is not defined, fallback to text, otherwise use default text
        // if first item in the item array is a function then invoke .call()
        // if first item is a string, then text should be the string.

        var text = DEFAULT_ITEM_TEXT;
        var currItemParam = angular.extend({}, params);
        currItemParam.text = text;
        currItemParam.nestedMenu = nestedMenu;
        currItemParam.enabled = isOptionEnabled(currItemParam);

        // START Processing text
        var textParam = item[0];
        if (typeof textParam === 'function' || typeof textParam === 'string' || typeof item.text !== "undefined") {
            text = processTextItem(currItemParam);
        } else if (typeof item.html === 'function') {
            // leave styling open to dev
            text = item.html($scope);
        } else if (typeof item.html !== "undefined") {
            // leave styling open to dev
            text = item.html;
        }

        // Need to re-assign after all the processing above
        currItemParam.text = text;
        $li.append(text);

        // END Processing text

        registerEnabledEvents(currItemParam);

    };

    var handlePromises = function ($ul, level, event, $promises) {
        /// <summary>
        /// calculate if drop down menu would go out of screen at left or bottom
        /// calculation need to be done after element has been added (and all texts are set; thus thepromises)
        /// to the DOM the get the actual height
        /// </summary>
        "use strict";
        $q.all($promises).then(function () {
            var topCoordinate  = event.pageY;
            var menuHeight = angular.element($ul[0]).prop('offsetHeight');
            var winHeight = window.scrollY + event.view.innerHeight;
            /// the 20 pixels in second condition are considering the browser status bar that sometimes overrides the element
            if (topCoordinate > menuHeight && winHeight - topCoordinate < menuHeight + 20) {
                topCoordinate = event.pageY - menuHeight;
                /// If the element is a nested menu, adds the height of the parent li to the topCoordinate to align with the parent
                if(level && level > 0) {
                  topCoordinate += event.event.currentTarget.offsetHeight;
                }
            } else if(winHeight <= menuHeight) {
                // If it really can't fit, reset the height of the menu to one that will fit
                angular.element($ul[0]).css({"height": winHeight - 5, "overflow-y": "scroll"});
                // ...then set the topCoordinate height to 0 so the menu starts from the top
                topCoordinate = 0;
            } else if(winHeight - topCoordinate < menuHeight) {
                var reduceThresholdY = 5;
                if(topCoordinate < reduceThresholdY) {
                    reduceThresholdY = topCoordinate;
                }
                topCoordinate = winHeight - menuHeight - reduceThresholdY;
            }

            var leftCoordinate = event.pageX;
            var menuWidth = angular.element($ul[0]).prop('offsetWidth');
            var winWidth = event.view.innerWidth;
            var rightPadding = 5;
            if (leftCoordinate > menuWidth && winWidth - leftCoordinate - rightPadding < menuWidth) {
                leftCoordinate = winWidth - menuWidth - rightPadding;
            } else if(winWidth - leftCoordinate < menuWidth) {
                var reduceThresholdX = 5;
                if(leftCoordinate < reduceThresholdX + rightPadding) {
                    reduceThresholdX = leftCoordinate + rightPadding;
                }
                leftCoordinate = winWidth - menuWidth - reduceThresholdX - rightPadding;
            }

            $ul.css({
                display: 'block',
                position: 'absolute',
                left: leftCoordinate + 'px',
                top: topCoordinate + 'px'
            });
        });

    };

    var registerEnabledEvents = function (params) {
        /// <summary>If item is enabled, register various mouse events.</summary>

        // Destructuring:
        var item = params.item;
        var $ul = params.$ul;
        var $li = params.$li;
        var $scope = params.$scope;
        var modelValue = params.modelValue;
        var level = params.level;
        var event = params.event;
        var text = params.text;
        var nestedMenu = params.nestedMenu;
        var enabled = params.enabled;

        if (enabled) {
            var openNestedMenu = function ($event) {
                removeContextMenus(level + 1);
                /*
                 * The object here needs to be constructed and filled with data
                 * on an "as needed" basis. Copying the data from event directly
                 * or cloning the event results in unpredictable behavior.
                 */
                /// adding the original event in the object to use the attributes of the mouse over event in the promises
                var ev = {
                    pageX: event.pageX + $ul[0].offsetWidth - 1,
                    pageY: $ul[0].offsetTop + $li[0].offsetTop - 3,
                    view: event.view || window,
                    event: $event
                };

                /*
                 * At this point, nestedMenu can only either be an Array or a promise.
                 * Regardless, passing them to `when` makes the implementation singular.
                 */
                $q.when(nestedMenu).then(function(promisedNestedMenu) {
                    var nestedParam = {
                      "$scope" : $scope,
                      "event" : ev,
                      "options" : promisedNestedMenu,
                      "modelValue" : modelValue,
                      "level" : level + 1
                    };
                    renderContextMenu(nestedParam);
                });
            };

            $li.on('click', function ($event) {
                if($event.which == 1) {
                  $event.preventDefault();
                  $scope.$apply(function () {
                      if (nestedMenu) {
                          openNestedMenu($event);
                      } else {
                          $(event.currentTarget).removeClass('context');
                          removeContextMenus();

                          if (angular.isFunction(item[1])) {
                              item[1].call($scope, $scope, event, modelValue, text, $li);
                          } else {
                              item.click.call($scope, $scope, event, modelValue, text, $li);
                          }
                      }
                  });
                }
            });

            $li.on('mouseover', function ($event) {
                $scope.$apply(function () {
                    if (nestedMenu) {
                        openNestedMenu($event);
                    /// Implementation made by dashawk
                    } else {
                        removeContextMenus(level + 1);
                    }
                });
            });
        } else {
            $li.on('click', function ($event) {
                $event.preventDefault();
            });
            $li.addClass('disabled');
        }

    };

    /**
     * Responsible for the actual rendering of the context menu.
     *
     * The parameters in params are:
     * - $scope = the scope of this context menu
     * - event = the event that triggered this context menu
     * - options = the options for this context menu
     * - modelValue = the value of the model attached to this context menu
     * - level = the current context menu level (defauts to 0)
     * - customClass = the custom class to be used for the context menu
     */
    function renderContextMenu (params) {
        /// <summary>Render context menu recursively.</summary>

        // Destructuring:
        var $scope = params.$scope;
        var event = params.event;
        var options = params.options;
        var modelValue = params.modelValue;
        var level = params.level;
        var customClass = params.customClass;

        $(event.currentTarget).addClass('context');

        // Initialize the container. This will be passed around
        var $ul = initContextMenuContainer(params);

        var $promises = [];

        angular.forEach(options, function (item) {

            var $li = $('<li>');
            if (item === null) {
                $li.addClass('divider');
            } else if (typeof item[0] === "object") {
                custom.initialize($li, item);
            } else {
                var itemParams = angular.extend({}, params);
                itemParams.item = item;
                itemParams.$ul = $ul;
                itemParams.$li = $li;
                itemParams.$promises = $promises;
                processItem(itemParams);
            }
            $ul.append($li);
        });

        var height = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        $(document).find('body').append($ul);

        handlePromises($ul, level, event, $promises);

        if(params.level === 0) {
          $(document.body).on('mousedown', removeOnOutsideClickEvent);
          /// remove the menu when the scroll moves
          $(document).on('scroll', removeOnScrollEvent);
        }

        $scope.$on("$destroy", function () {
            removeContextMenus();
        });

        _contextMenus.push($ul);

        function removeOnScrollEvent(e) {
            removeAllContextMenus(e);
        }

        function removeOnOutsideClickEvent(e) {

          var $curr = $(e.target);
          var shouldRemove = true;

          while($curr.length) {
            if($curr.hasClass("dropdown-menu")) {
              shouldRemove = false;
              break;
            } else {
              $curr = $curr.parent();
            }
          }
          if ( shouldRemove ) {
            removeAllContextMenus(e);
          }
        }

        function removeAllContextMenus(e) {
            $(document.body).off('mousedown', removeOnOutsideClickEvent);
            $(document).off('scroll', removeOnScrollEvent);
            $(event.originalTarget).removeClass('context');
            removeContextMenus();
        }
    };

    /**
     * Creates the container of the context menu (a <ul> element),
     * applies the appropriate styles and then returns that container
     *
     * @return a <ul> jqLite/jQuery element
     */
    function initContextMenuContainer(params) {
      var $ul = $('<ul>');
      $ul.addClass('dropdown-menu');
      $ul.attr({ 'role': 'menu' });
      $ul.css({
          display: 'block',
          position: 'absolute',
          left: params.event.pageX + 'px',
          top: params.event.pageY + 'px',
          "z-index": 10000
      });

      return $ul;
    }

    // if item is object, and has enabled prop invoke the prop
    // else if fallback to item[2]
    function isOptionEnabled (params) {
        var item = params.item;
        var $scope = params.$scope;
        var event = params.event;
        var modelValue = params.modelValue;
        var text = params.text;

        if (typeof item.enabled !== "undefined") {
            return item.enabled.call($scope, $scope, event, modelValue, text);
        } else if (typeof item[2] === "function") {
            return item[2].call($scope, $scope, event, modelValue, text);
        } else {
            return true;
        }
    };

    function isTouchDevice() {
      return 'ontouchstart' in window  || navigator.maxTouchPoints; // works on most browsers | works on IE10/11 and Surface
    }

    /**
     *
     */
    function removeContextMenus (level) {
        while (_contextMenus.length && (!level || _contextMenus.length > level)) {
            _contextMenus.pop().remove();
        }
    }

    return function ($scope, element, attrs) {
        var openMenuEvent = "contextmenu";
        if(attrs.contextMenuOn && typeof(attrs.contextMenuOn) === "string"){
            openMenuEvent = attrs.contextMenuOn;
        }
        element.on(openMenuEvent, function (event) {
            if(!attrs.allowEventPropagation) {
              event.stopPropagation();
              event.preventDefault();
            }

            // Don't show context menu if on touch device and element is draggable
            if(isTouchDevice() && element.attr('draggable') === 'true') {
              return false;
            }

            $scope.$apply(function () {
                var options = $scope.$eval(attrs.contextMenu);
                var customClass = attrs.contextMenuClass;
                var modelValue = $scope.$eval(attrs.model);

                var params = {
                  "$scope" : $scope,
                  "event" : event,
                  "options" : options,
                  "modelValue" : modelValue,
                  "level" : 0,
                  "customClass" : customClass
                };

                if (options instanceof Array) {
                    if (options.length === 0) { return; }
                    renderContextMenu(params);
                } else {
                    throw '"' + attrs.contextMenu + '" not an array';
                }
            });
        });
    };
}]);

})(window.angular.element);
