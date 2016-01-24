angular.module('ui.bootstrap.contextMenu', [])

.directive('contextMenu', ["$parse", "$q", function ($parse, $q) {

    var contextMenus = [];

    /**
     * Remove context menu.
     * @param level
     */
    var removeContextMenus = function (level) {
        while (contextMenus.length && (!level || contextMenus.length > level)) {
            contextMenus.pop().remove();
        }
        if (contextMenus.length == 0 && $currentContextMenu) {
            $currentContextMenu.remove();
        }
    };

    var $currentContextMenu = null;


    /**
     * Process individual item
     * @param $scope
     * @param event
     * @param model
     * @param item
     * @param $ul
     * @param $li
     * @param $promises
     * @param $q
     * @param $
     */
    var processItem = function($scope, event, model, item, $ul, $li, $promises, $q, $) {
        "use strict";
        var nestedMenu = angular.isArray(item[1])
            ? item[1] : angular.isArray(item[2])
            ? item[2] : angular.isArray(item[3])
            ? item[3] : null;
        var $a = $('<a>');
        $a.css("padding-right", "8px");
        $a.attr({ tabindex: '-1', href: '#' });
        var text = typeof item[0] == 'string' ? item[0] : item[0].call($scope, $scope, event, model);
        var $promise = $q.when(text);
        $promises.push($promise);
        $promise.then(function (text) {
            $a.text(text);
            if (nestedMenu) {
                $a.css("cursor", "default");
                $a.append($('<strong style="font-family:monospace;font-weight:bold;float:right;">&gt;</strong>'));
            }
        });
        $li.append($a);

        var enabled = angular.isFunction(item[2]) ? item[2].call($scope, $scope, event, model, text) : true;
        registerEnabledEvents($scope, enabled, item, $ul, $li, nestedMenu, model, text, $);
    };


    /**
     * calculate if drop down menu would go out of screen at left or bottom
     * calculation need to be done after element has been added (and all texts are set; thus thepromises)
     * to the DOM the get the actual height
     * @param $ul
     * @param level
     * @param $promises
     */

    var handlePromises = function($ul, level, $promises) {
        "use strict";
        $q.all($promises).then(function(){
            if(level === 0){
                var topCoordinate = event.pageY;
                var menuHeight = angular.element($ul[0]).prop('offsetHeight');
                var winHeight = event.view.innerHeight;
                if (topCoordinate > menuHeight && winHeight - topCoordinate < menuHeight) {
                    topCoordinate = event.pageY - menuHeight;
                }

                var leftCoordinate = event.pageX;
                var menuWidth = angular.element($ul[0]).prop('offsetWidth');
                var winWidth = event.view.innerWidth;
                if(leftCoordinate > menuWidth && winWidth - leftCoordinate < menuWidth){
                    leftCoordinate = event.pageX - menuWidth;
                }

                $ul.css({
                    display: 'block',
                    position: 'absolute',
                    left: leftCoordinate + 'px',
                    top: topCoordinate + 'px'
                });
            }
        });

    };


    /**
     * If item is enabled, register various mouse events
     * @param $scope
     * @param enabled
     * @param $ul
     * @param $li
     * @param nestedMenu
     * @param model
     */
    var registerEnabledEvents = function($scope, enabled, item, $ul,  $li, nestedMenu, model, text, $) {
        if (enabled) {

            var openNestedMenu = function ($event) {
                removeContextMenus(level + 1);
                var ev = {
                    pageX: event.pageX + $ul[0].offsetWidth - 1,
                    pageY: $ul[0].offsetTop + $li[0].offsetTop - 3
                };
                renderContextMenu($scope, ev, nestedMenu, model, level + 1);
            };

            $li.on('click', function ($event) {
                $event.preventDefault();
                $scope.$apply(function () {
                    if (nestedMenu) {
                        openNestedMenu($event);
                    } else {
                        $(event.currentTarget).removeClass('context');
                        removeContextMenus();
                        item[1].call($scope, $scope, event, model, text);
                    }
                });
            });

            $li.on('mouseover', function ($event) {
                $scope.$apply(function () {
                    if (nestedMenu) {
                        openNestedMenu($event);
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


    var renderContextMenu = function ($scope, event, options, model, level) {
        if (!level) { level = 0; }
        if (!$) { var $ = angular.element; }
        $(event.currentTarget).addClass('context');
        var $contextMenu = $('<div>');
        if ($currentContextMenu) {
            $contextMenu = $currentContextMenu;
        } else {
            $currentContextMenu = $contextMenu;
        }
        $contextMenu.addClass('dropdown clearfix');
        var $ul = $('<ul>');
        $ul.addClass('dropdown-menu');
        $ul.attr({ 'role': 'menu' });
        $ul.css({
            display: 'block',
            position: 'absolute',
            left: event.pageX + 'px',
            top: event.pageY + 'px',
            "z-index": 10000
        });

        var $promises = [];

        angular.forEach(options, function (item, i) {
            var $li = $('<li>');
            if (item === null) {
                $li.addClass('divider');
            } else {
                processItem($scope, event, model, item, $ul, $li, $promises, $q, $);
            }
            $ul.append($li);
        });
        $contextMenu.append($ul);
        var height = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        $contextMenu.css({
            width: '100%',
            height: height + 'px',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 9999
        });
        $(document).find('body').append($contextMenu);

        handlePromises($ul, level, $promises);

        $contextMenu.on("mousedown", function (e) {
            if ($(e.target).hasClass('dropdown')) {
                $(event.currentTarget).removeClass('context');
                removeContextMenus();
            }
        }).on('contextmenu', function (event) {
            $(event.currentTarget).removeClass('context');
            event.preventDefault();
            removeContextMenus(level);
        });

        $scope.$on("$destroy", function () {
            removeContextMenus();
        });

        contextMenus.push($ul);
    };
    return function ($scope, element, attrs) {
        element.on('contextmenu', function (event) {
            event.stopPropagation();
            $scope.$apply(function () {
                event.preventDefault();
                var options = $scope.$eval(attrs.contextMenu);
                var model = $scope.$eval(attrs.model);
                if (options instanceof Array) {
                    if (options.length === 0) { return; }
                    renderContextMenu($scope, event, options, model);
                } else {
                    throw '"' + attrs.contextMenu + '" not an array';
                }
            });
        });
    };
}]);
