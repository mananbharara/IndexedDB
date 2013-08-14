angular.module('IndexedDB', []).service('IndexedDB', function ($rootScope, $q) {

  var deferred = $q.defer();
  var request = indexedDB.open("open_lmis", 4);
  var indexedDBConnection = null;
  var thisService = this;

  request.onsuccess = function (event) {
    indexedDBConnection = event.currentTarget.result;
    deferred.resolve();
    $rootScope.$apply();
  };

  request.onupgradeneeded = function (event) {
    var connection = event.currentTarget.result;

    var dropDatastores = function () {
      $(connection.objectStoreNames).each(function (index, objectStore) {
        connection.deleteObjectStore(objectStore);
      });
    };

    if (!event.oldVersion || event.oldVersion < 4) {
      //TODO remove drop database logic before release
      dropDatastores();
      createDistributionStore();
      createDistributionReferenceData();
    }

    function createDistributionStore() {
      var distributionStore = connection.createObjectStore("distributions", {"keyPath": "id"});
      distributionStore.createIndex("index_zpp", "zpp", {"unique": true});
    }

    function createDistributionReferenceData() {
      var distributionReferenceDataStore = connection.createObjectStore("distributionReferenceData", {"keyPath": "distributionId"});
      distributionReferenceDataStore.createIndex("index_reference_data", "distributionId", {"unique": true});
    }
  };

  this.transaction = function (transactionFunction) {
    if (!indexedDBConnection) {
      deferred.promise.then(function () {
        transactionFunction(indexedDBConnection);
      });
    } else {
      transactionFunction(indexedDBConnection);
    }
  };

  var initTransaction = function (connection, objectStore, completeFunc, transactionMode) {
    transactionMode = transactionMode ? transactionMode : 'readonly';
    var transaction = connection.transaction(objectStore, transactionMode);
    transaction.oncomplete = function (e) {
      if (completeFunc) {
        completeFunc(e);
      }
      if (!$rootScope.$$phase) $rootScope.$apply();
    };
    return transaction;
  };

  var initRequestCallbacks = function (request, successFunc, errorFunc) {
    request.onsuccess = successFunc || function () {
    };

    request.onerror = function (e) {
      console.log(e);
      if (errorFunc) errorFunc(e);
    };
  };

  this.get = function (objectStore, operationKey, successFunc, errorFunc, completeFunc) {
    thisService.transaction(function (connection) {
      var transaction = initTransaction(connection, objectStore, completeFunc);

      var request = transaction.objectStore(objectStore).get(operationKey);

      initRequestCallbacks(request, successFunc, errorFunc);
    });
  };

  this.put = function (objectStore, data, successFunc, errorFunc, completeFunc) {
    thisService.transaction(function (connection) {
      var transaction = initTransaction(connection, objectStore, completeFunc, 'readwrite');

      var request = transaction.objectStore(objectStore).put(data);

      initRequestCallbacks(request, successFunc, errorFunc);
    });

  }

});
