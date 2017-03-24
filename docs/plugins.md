**DRAFT / PLACEHOLDER**

```js
function plugin(app) {
  // do stuff to "app"
}


function plugin(app) {
  // do stuff to "app"
  return function(collection) {
    // do stuff to "collection"
  };
}


function plugin(app) {
  // do stuff to "app"
  return function(collection) {
    // do stuff to "collection"
    return function(view) {
      // do stuff to "view"
    };
  };
}


function plugin(view) {
  if (!view.isView) return plugin;
  // do stuff to "view"
}

var i = 0;
function plugin(obj) {
  obj.foo = i++;
}

app.use(plugin);
console.log(app.foo);
//=> 1
```
