
var el = document.getElementsByTagName('pre')[0];


var evt = {
  bind: function(el, evt, fn){
    el.addEventListener(evt, fn, false);
  }
};


var st;

function saveScrollPos(){
  if(st === undefined) st = el.scrollTop;
  setTimeout(function(){
    st = undefined;
  }, 500);
}

function restoreScrollPos(){
  el.scrollTop = st;
  st = undefined;
}

String.prototype.splice = function(i, remove, add){
  remove = +remove || 0;
  add = add || '';

  return this.slice(0,i) + add + this.slice(i+remove);
};

var ed = new Editor(el);
