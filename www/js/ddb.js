var Todo = {};
var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
  window.IDBTransaction = window.webkitIDBTransaction;
  window.IDBKeyRange = window.webkitIDBKeyRange;
}

Todo.indexedDB = {};
Todo.indexedDB.db = null;
Todo.indexedDB.onerror = function(e) {
  console.log(e);
};

$(document).ready(function() {
  Todo.indexedDB.open(); // open displays the data previously saved
  Todo.initSubmit();
  //Todo.showLinks();
});


Todo.initSubmit = function() {
  $('form[action="todos"]').submit(function() {
    Todo.indexedDB.addTodo($(this).find('input[type="text"]').attr('value'));
    $('#todo').attr('value','');
    return false;
  });
};

Todo.showLinks = function() {
  $.getJSON('delicious.json?ooxss',function(data) {
    for (var k in data) {
      var obj = data[k];
      obj.text = k;
      //Todo.indexedDB.addTodo(obj)
      //renderTodo(obj);
    }
  });
};

Todo.indexedDB.open = function() {
  var request = indexedDB.open("todos1","pkeane's todo lister");
  request.onsuccess = function(e) {   
    var v = "1.0";
    Todo.indexedDB.db = e.result || request.result;
    var db = Todo.indexedDB.db;
    if(v!= db.version) {
      var setVrequest = db.setVersion(v);
      // onsuccess is the only place we can create Object Stores
      setVrequest.onfailure = Todo.indexedDB.onerror;
      setVrequest.onsuccess = function(e) {
        var store = db.createObjectStore("todo",{keyPath: "key"});
        Todo.indexedDB.getAllTodoItems();
      };
    } else {
      Todo.indexedDB.getAllTodoItems();
    }
  };
  request.onfailure = Todo.indexedDB.onerror;
};

Todo.indexedDB.addTodo = function(txt) {
  var db = Todo.indexedDB.db;
  var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE, 0);
  var store = trans.objectStore("todo");
  var stamp = new Date().getTime() 
	var row = {
		"text": txt, 
		"timeStamp" : stamp,
    "key": 'a'+stamp+txt 
	};
	var request = store.put(row);
  request.onsuccess = function(e) {
		Todo.renderTodo(row,true);
  };
  request.onerror = function(e) {
    console.log('error')
  };
};

Todo.indexedDB.getAllTodoItems = function() {
  var todos = document.getElementById("todoItems");
  todos.innerHTML = "";

  var db = Todo.indexedDB.db;
  var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE, 0);
  var store = trans.objectStore("todo");

  // Get everything in the store;
  var cursorRequest = store.openCursor(null,IDBCursor.NEXT);


  cursorRequest.onsuccess = function(e) {
    var result = e.result || cursorRequest.result;
    if(result == null) {
      Todo.attachDeleteListeners();
      return;
    }
    Todo.renderTodo(result.value,false); // Defined a little later.
    result.continue();
  };
  cursorRequest.onerror = Todo.indexedDB.onerror;
};

Todo.attachDeleteListeners = function() {
  $('#todoItems').find('a').click(function() {
    Todo.indexedDB.deleteTodo($(this).attr('href'));
    return false;
  });

};

Todo.renderTodo = function(row,addListeners) {
  var li = '\n<li id="'+row.key+'">'+row.text+' [<a href="'+row.key+'">x</a>]</li>';
  var todos = document.getElementById("todoItems");
  todos.innerHTML = li + todos.innerHTML;
  if (addListeners) {
    Todo.attachDeleteListeners();
  }
};

Todo.indexedDB.deleteTodo = function(id) {
  var db = Todo.indexedDB.db;
  var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE, 0);
  var store = trans.objectStore("todo");
  var request = store.delete(id);
  request.onsuccess = function(e) {
    //Todo.indexedDB.getAllTodoItems();  // Refresh the screen
    $('#'+id).remove();
  };
  request.onerror = function(e) {
    console.log(e);
  };
};
