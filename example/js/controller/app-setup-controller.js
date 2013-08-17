function AppSetupController(IndexedDB) {
  this.save = function () {
    IndexedDB.put("sample", this.sample);
  }
}
