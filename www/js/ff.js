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
});

function addTodo() {
  var todo = document.getElementById('todo');
  Todo.indexedDB.addTodo(todo.value);
  todo.value = '';
}

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
        var store = db.createObjectStore("todo",{keyPath: "text"});
        Todo.indexedDB.getAllTodoItems();
      };
    } else {
      Todo.indexedDB.getAllTodoItems();
    }
  };
  request.onfailure = Todo.indexedDB.onerror;
};

Todo.indexedDB.addTodo = function(todoText) {
  var db = Todo.indexedDB.db;
  var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE, 0);
  var store = trans.objectStore("todo");
	var row = {
		"text": todoText, 
		"timeStamp" : new Date().getTime() 
	};
	var request = store.put(row);
  request.onsuccess = function(e) {
    console.log(e.value);
		renderTodo(row);
  };
  request.onerror = function(e) {
    console.log(e.value);
  };
};

Todo.indexedDB.getAllTodoItems = function() {
  var todos = document.getElementById("todoItems");
  todos.innerHTML = "";

  var db = Todo.indexedDB.db;
  var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE, 0);
  var store = trans.objectStore("todo");

  // Get everything in the store;
  var cursorRequest = store.openCursor();

  cursorRequest.onsuccess = function(e) {
    var result = e.result || cursorRequest.result;
    if(result == null) return;
    renderTodo(result.value); // Defined a little later.
    result.continue();
  };
  cursorRequest.onerror = Todo.indexedDB.onerror;
};

function renderTodo(row) {
  var todos = document.getElementById("todoItems");
  var li = document.createElement("li");
  var a = document.createElement("a");
  var t = document.createTextNode(row.text);
  //t.data = row.text;
  a.addEventListener("click", function(e) {
    Todo.indexedDB.deleteTodo(row.text);
  }, false);
  a.textContent = " [Delete]";
  li.appendChild(t);
  li.appendChild(a);
  todos.appendChild(li)
}

Todo.indexedDB.deleteTodo = function(id) {
  var db = Todo.indexedDB.db;
  var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE, 0);
  var store = trans.objectStore("todo");
  var request = store.delete(id);
  request.onsuccess = function(e) {
    Todo.indexedDB.getAllTodoItems();  // Refresh the screen
  };
  request.onerror = function(e) {
    console.log(e);
  };
};
