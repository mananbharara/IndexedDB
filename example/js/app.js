angular.module('indexedDbExample', ['IndexedDB']).config(function (IndexedDBProvider) {
  IndexedDBProvider
    .setDbName('SampleDatabase')
    .migration(1, migrationFunc);
});