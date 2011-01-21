from HTMLParser import HTMLParser
import md5
import json

DATA = {};
CURRENT_HEX = ''

class MyHTMLParser(HTMLParser):

  HEX = ''

  def handle_starttag(self, tag, attrs):
    if 'a' == tag:
      for a in attrs:
        if 'href' == a[0]:
          url = a[1]
          m = md5.new()
          m.update(url)
          CURRENT_HEX = m.hexdigest()
          self.HEX = CURRENT_HEX
          if DATA.has_key(CURRENT_HEX):
            pass
          else:
            DATA[CURRENT_HEX] = {}
            DATA[CURRENT_HEX]['url'] = url 
            DATA[CURRENT_HEX]['tags'] = [] 

        if 'tags' == a[0]:
          tags = a[1].split(',')
          for t in tags:
            DATA[CURRENT_HEX]['tags'].append(t)

  def handle_data(self,data):
    if data.strip() and DATA.has_key(self.HEX):
      DATA[self.HEX]['title'] = data

if __name__=="__main__":
  fh = open('delicious.html')
  p = MyHTMLParser()
  p.feed(fh.read())
  print json.dumps(DATA)
