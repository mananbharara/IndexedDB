

angular.module('autoSave', []).directive('autoSave', function ($route, IndexedDB, $timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {

      var save = function () {
        IndexedDB.put(attrs.objectStore, scope[attrs.autoSave]);
      };

      $timeout(function () {
        element.find('input, textarea').bind('blur', save);
      }, 100);
    }
  };
});