#!/usr/bin/env node

var fs = require('fs');
var sys = require('sys');
var jqtpl = require('jqtpl');
var async = require('async');

var t = {}
t.basic = fs.readFileSync('templates/basic.tmpl').toString();
t.text = fs.readFileSync('templates/text.tmpl').toString();
t.select = fs.readFileSync('templates/select.tmpl').toString();
var fdata = JSON.parse(fs.readFileSync('form.json').toString());

var d = {};
d.els = [];
for (var i in fdata.elements) {
  var data = fdata.elements[i];
  d.els.push(jqtpl.tmpl(t[data.type],data)); 
}
out = jqtpl.tmpl(t.basic,d);
sys.puts(out);

