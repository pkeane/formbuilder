//for Firefox4b9

/*Pre Requisites*/

// Initialising the window.IndexedDB Object
window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB;
var DAO = {};

/*Open Database*/

document.write("Trying to open database ...");
var request = window.indexedDB.open("BookShop-1", "My Book Shop - 1 database");
request.onsuccess = function(event){
  DAO.db = request.result;
  document.write("Database Opened", DAO.db);
};
request.onerror = function(e){
  writeError(e);
};

ConsoleHelper.waitFor("DAO.db", function(){
  var request = DAO.db.setVersion(parseInt(DAO.db.version) + 1);
  request.onsuccess = function(e){
    document.write("Version changed to ", DAO.db.version, ", so trying to create a database now.");
    DAO.objectStore = DAO.db.createObjectStore("BookList", {
      "keyPath": "id"
    }, true);
    document.write("Object store created: ", DAO.objectStore);
  };
  request.onerror = function(e){
    document.write("Could not set the version, so cannot create database", e);
  };
});

ConsoleHelper.waitFor("DAO.db", function(){
  document.write("Opening an Object Store using a transaction.");
  DAO.newTransactionObjectStore = function(){
    try {
      var transaction = DAO.db.transaction(["BookList"], 0 /*Read-Write*/, 1000 /*Time out in ms*/);
      transaction.oncomplete = function(e){
        delete DAO.objectStore;
        document.write("===== Transaction Complete");
      };
      transaction.onabort = function(e){
        document.write("===== Transaction Aborted");
      };
      DAO.objectStore = transaction.objectStore("BookList");
      document.write("==== New Transaction", DAO.objectStore);
    }
    catch (e) {
      write("Could not open objectStore. You may have to create it first");
      writeError(e);
    }
  };
  DAO.newTransactionObjectStore();
  write("Object Store Opened", DAO.objectStore);
});

ConsoleHelper.waitFor("DAO.db", function(){
  write("List of Object Stores", DAO.db.objectStoreNames);
});

ConsoleHelper.waitFor("DAO.db", function(){
  write("Trying to change the database version");
  var request = DAO.db.setVersion(parseInt(Math.random() * 100));
  write("Database version changed, now trying to delete the database");
  request.onsuccess = function(e){
    DAO.db.deleteObjectStore("BookList");
    write("Deleted Object store Booklist. The remaining object stores are ", DAO.db.objectStoreNames);
  };
});

var data = {
  "bookName": "Book-" + Math.random(),
  "author": "asdasd",
  "price": parseInt(Math.random() * 1000),
  "rating": (Math.random() > 0.5 ? "good" : "bad"),
  "id": new Date().getTime()
};

ConsoleHelper.waitFor("DAO.newTransactionObjectStore", function(){
  DAO.newTransactionObjectStore();
  document.write("Trying to save...", data);
  var request = DAO.objectStore.add(data);
  request.onsuccess = function(event){
    document.write("Saved id ", request.result);
    DAO.objectId = request.result;
  };
  request.onerror = function(e){
    writeError(e);
    DAO.transaction.abort();
  };
});

ConsoleHelper.waitFor("DAO.objectId", function(){
  DAO.newTransactionObjectStore();
  document.write("Trying to get the last saved object using saved example with id ", DAO.objectId);
  var request = DAO.objectStore.get(DAO.objectId);
  request.onsuccess = function(event){
    document.write("Got data ", request.result);
    DAO.objectId = request.result.id;
  };
  request.onerror = function(e){
    document.write("Could not get object");
    writeError(e);
  };
});

ConsoleHelper.waitFor("DAO.objectId", function(){
  var modifiedData = {
    "bookName": "Modified-" + Math.random(),
    "new_prop": "Modified",
    "rating": (Math.random() > 0.5 ? "good" : "bad"),
    "id": DAO.objectId
  };
  DAO.newTransactionObjectStore();
  document.write("Trying to modify the last saved object using saved example...", modifiedData);
  var request = DAO.objectStore.put(modifiedData);
  request.onsuccess = function(event){
    document.write("Modified id ", request.result);
    DAO.objectId = request.result;
  };
  request.onerror = function(){
    document.write("Could not modify object");
  };
});

ConsoleHelper.waitFor("DAO.newTransactionObjectStore", function(){
  DAO.newTransactionObjectStore();
  document.write("Getting all data ... ");
  var request = DAO.objectStore.getAll();
  request.onsuccess = function(e){
    document.write("List of objects ", request.result);
    DAO.objectId = request.result[request.result.length - 1].id;
  };
  request.onerror = function(e){
    document.write("Could not get all objects");
  };
});

ConsoleHelper.waitFor("DAO.objectId", function(){
  DAO.newTransactionObjectStore();
  document.write("Trying to delete the last saved object using saved example...", DAO.objectId);
  var request = DAO.objectStore["delete"](DAO.objectId);
  request.onsuccess = function(event){
    document.write("Removed id ", request.result);
    delete DAO.objectId;
  };
  request.onerror = function(){
    document.write("Could not delete object");
  };
});

ConsoleHelper.waitFor("DAO.objectId", function(){
  DAO.newTransactionObjectStore();
  document.write("Trying to delete the last saved object using saved example...", DAO.objectId);
  var request = DAO.objectStore.clear();
  request.onsuccess = function(event){
    document.write("Cleared ObjectStore");
  };
  request.onerror = function(){
    document.write("Could not delete object");
  };
});

ConsoleHelper.waitFor("DAO.newTransactionObjectStore", function(){
  // Function to call when a new cursor is required
  DAO.onCursor = function(callback){
    DAO.newTransactionObjectStore();
    var request = DAO.objectStore.openCursor();
    request.onsuccess = function(event){
      DAO.cursor = request.result;
      callback();
    };
    request.onerror = function(event){
      write("Could not open cursor", DAO.cursor);
      writeError(e);
    };
  };
  DAO.onCursor(function(){
    write("Cursor Created", DAO.cursor);
  });
});

/**
* Args : Lower Bound, Upper Bound, Include Lower val? , Include Upper Val?
*/
ConsoleHelper.waitFor("DAO.newTransactionObjectStore", function(){
  // Function to call when a new cursor is required
  DAO.keyRange = new IDBKeyRange.bound(1, 30, true, false);
  write("Range Defined", DAO.keyRange);
  
  DAO.onCursor = function(callback){
    DAO.newTransactionObjectStore();
    var request = DAO.objectStore.openCursor(DAO.keyRange);
    request.onsuccess = function(event){
      DAO.cursor = request.result;
      callback();
    };
    request.onerror = function(event){
      write("Could not open cursor", DAO.cursor);
      writeError(e);
    };
  };
  DAO.onCursor(function(){
    write("Cursor Created", DAO.cursor);
  });
});

ConsoleHelper.waitFor("DAO.onCursor", function(){
  DAO.onCursor(function(){
    if (!DAO.cursor) {
      return;
    }
    write(DAO.cursor.key, DAO.cursor.value);
    DAO.cursor["continue"]();
  });
});

ConsoleHelper.waitFor("DAO.onCursor", function(){
  DAO.onCursor(function(){
    if (!DAO.cursor) {
      return;
    }
    DAO.cursor.value["new_prop_cursor"] = Math.random();
    write("Updating", DAO.cursor.key, DAO.cursor.value);
    DAO.cursor.update(DAO.cursor.value);
    DAO.cursor["continue"]();
  });
});

ConsoleHelper.waitFor("DAO.onCursor", function(){
  DAO.onCursor(function(){
    if (!DAO.cursor) {
      return;
    }
    write("Removing", DAO.cursor.key, DAO.cursor.value);
    DAO.cursor["delete"]();
    DAO.cursor["continue"]();
  });
});

ConsoleHelper.waitFor("DAO.newTransactionObjectStore", function(){
  DAO.newTransactionObjectStore();
  write("Indexes", DAO.objectStore.indexNames);
});

ConsoleHelper.waitFor("DAO.db", function(){
  write("Changing the database version");
  var request = DAO.db.setVersion(parseInt(DAO.db.version) + 1);
  request.onsuccess = function(e){
    write("Database version changed, now trying to create an Index");
    var transaction = request.transaction;
    var objectStore = transaction.objectStore("BookList");
    DAO.index = objectStore.createIndex("priceIndex", "price");
    write("Index created", DAO.index);
  };
  request.onerror = function(e){
    writeError(e);
  };
});

ConsoleHelper.waitFor("DAO.newTransactionObjectStore", function(){
  DAO.getIndex = function(){
    try {
      DAO.newTransactionObjectStore();
      DAO.index = DAO.objectStore.index("priceIndex");
    }
    catch (e) {
      write("Could not open Index, create it first");
      writeError(e);
    }
  }
    DAO.getIndex();
  write("Opened Index", DAO.index);
});

ConsoleHelper.waitFor("DAO.index", function(){
  write("Starting to iterate on object cursor...");
  DAO.getIndex();
  var cursorRequest = DAO.index.openKeyCursor();
  cursorRequest.onsuccess = function(event){
    var objectCursor = event.result;
    if (!objectCursor) {
      return;
    }
    write("Indexed on price:", objectCursor.key, "Object id-", objectCursor.value);
    objectCursor["continue"]();
  };
  request.onerror = function(event){
    write("Could not open Object Store", event);
  };
});

ConsoleHelper.waitFor("DAO.index", function(){
  write("Starting to iterate on object cursor...");
  DAO.getIndex();
  var cursorRequest = DAO.index.openCursor();
  cursorRequest.onsuccess = function(event){
    var objectCursor = event.result;
    if (!objectCursor) {
      return;
    }
    write(objectCursor.key, objectCursor.value);
    objectCursor["continue"]();
  };
  request.onerror = function(event){
    write("Could not open Object Store", event);
  };
});

ConsoleHelper.waitFor("DAO.db", function(){
  write("Changing the version of the database");
  var request = DAO.db.setVersion(parseInt(DAO.db.version) + 1);
  request.onsuccess = function(e){
    write("Database version change, now trying to delete the index");
    var transaction = request.result;
    var objectStore = transaction.objectStore("BookList");
    DAO.index = objectStore.deleteIndex("priceIndex");
    write("Index Deleted");
  };
  request.onerror = function(e){
    writeError(e);
  };
});

ConsoleHelper.waitFor("DAO.db", function(){
  var request = DAO.db.setVersion(parseInt(Math.random() * 100));
  write("Trying to change the version of the database");
  request.onsuccess = function(){
    write("Set the version of the database to", DAO.db.version);
  };
});

ConsoleHelper.waitFor("DAO.db", function(){
  DAO.db.close();
});


