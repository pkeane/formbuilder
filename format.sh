#!/bin/sh

if [ -f $1 ]
then 
  str=$1
else 
  read str
fi

cat $str | sed 's/<\([^/]\)/\n<\1/g' | sed 's/ <\//\n<\//g'

