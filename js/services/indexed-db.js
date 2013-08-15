angular.module('IndexedDB', []).provider('IndexedDB', function () {

  var thisService = this;
  var db, onUpgrade, version;

  thisService.setDbName = function (name) {
    db = name;
    return thisService;
  };

  thisService.migration = function (newVersion, upgradeFunction) {
    onUpgrade = upgradeFunction;
    version = newVersion;
    return thisService;
  };

  this.$get = function ($rootScope, $q) {

    var deferred = $q.defer();
    var request = indexedDB.open(db, version);
    var indexedDBConnection = null;

    request.onupgradeneeded = function (e) {
      onUpgrade(e);
      console.log(db + " database version upgraded");
    };

    request.onsuccess = function (event) {
      indexedDBConnection = event.currentTarget.result;
      deferred.resolve();
      $rootScope.$apply();
    };


    function initTransaction(connection, objectStore, completeFunc, transactionMode) {
      transactionMode = transactionMode ? transactionMode : 'readonly';
      var transaction = connection.transaction(objectStore, transactionMode);
      transaction.oncomplete = function (e) {
        if (completeFunc) {
          completeFunc(e);
        }
        if (!$rootScope.$$phase) $rootScope.$apply();
      };
      return transaction;
    }

    function initRequestCallbacks(request, successFunc, errorFunc) {
      request.onsuccess = successFunc || function () {
      };

      request.onerror = function (e) {
        console.log(e);
        if (errorFunc) errorFunc(e);
      };
    }

    var transaction = function (transactionFunction) {
      if (!indexedDBConnection) {
        deferred.promise.then(function () {
          transactionFunction(indexedDBConnection);
        });
      } else {
        transactionFunction(indexedDBConnection);
      }
    };

    var get = function (objectStore, operationKey, successFunc, errorFunc, completeFunc) {
      thisService.transaction(function (connection) {
        var transaction = initTransaction(connection, objectStore, completeFunc);

        var request = transaction.objectStore(objectStore).get(operationKey);

        initRequestCallbacks(request, successFunc, errorFunc);
      });
    };

    var put = function (objectStore, data, successFunc, errorFunc, completeFunc) {
      thisService.transaction(function (connection) {
        var transaction = initTransaction(connection, objectStore, completeFunc, 'readwrite');

        var request = transaction.objectStore(objectStore).put(data);

        initRequestCallbacks(request, successFunc, errorFunc);
      });

    };

    return {
      transaction: transaction,
      get: get,
      put: put
    }

  }

});
