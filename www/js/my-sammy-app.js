$(document).ready(function() {  
  DataSets.run('#/sets');  
}); 

var DataSets = $.sammy(function() {  

  this.element_selector = '#content';  
  this.use('Template');  
  this.use('Storage');  
  var msg = new Sammy.Store({name:'msg',type:'memory'});

  this.get('#/sets', function(context) {  
    context.app.swap('');  
    context.$element().append('<h1>inbox</h1>');  
  }); 

  this.get('#/label/:name', function(context) {  
    context.app.swap('');  
    context.$element().append('<h1>' + this.params['name'] + '</h1>');  
  });  

  this.get('#/result', function(context) {  
    context.app.swap('');  
    context.$element().append('<h1>' + msg.get('text') + '</h1>');  
  });  

  this.get('#/setform', function(context) {  
    context.app.swap('');  
    context.render('www/templates/setform.template', {})
    .appendTo(context.$element());
  });

  this.post('#/sets', function(context) {  
    context.app.swap('');  
    var name = this.params['name'];  
    msg.set('text','sorry, but '+name+' is taken');
    this.redirect('#/result');
    //context.$element().append('<h1>hi ' + to + '</h1>');  
  }); 

});  
