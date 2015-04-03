
var el = document.getElementsByTagName('pre')[0];

el.onkeyup = function(evt){
  var keyCode = evt && evt.keyCode || 0,
      code = this.textContent;

  if(keyCode < 9 || keyCode == 13 || keyCode > 32 && keyCode < 41) {
    // $t.trigger('caretmove');
  }

  if([
    9, 91, 93, 16, 17, 18, // modifiers
    20, // caps lock
    13, // Enter (handled by keydown)
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, // F[0-12]
    27 // Esc
  ].indexOf(keyCode) > -1) {
    return;
  }

  if([
		37, 39, 38, 40 // Left, Right, Up, Down
	].indexOf(keyCode) === -1) {
    // $t.trigger('contentchange', {
    //   keyCode: keyCode
    // });
    this.oninput();
  }
};

el.oninput = function(evt){
  var code = this.textContent;

  var ss = this.selectionStart,
    se = this.selectionEnd;

  this.innerHTML = Prism.highlight(code, md);
  // Prism.highlightElement(this); // bit messy + unnecessary + strips leading newlines :(

  // Dirty fix to #2
  // if(!/\n$/.test(code)) {
  //   this.innerHTML = this.innerHTML + '\n';
  // }

  if(ss !== null || se !== null) {
    this.setSelectionRange(ss, se);
  }
};

el.onkeydown = function(evt){
  var cmdOrCtrl = evt.metaKey || evt.ctrlKey;

  switch(evt.keyCode) {
    case 8: // Backspace
      // var ss = this.selectionStart,
      //   se = this.selectionEnd,
      //   length = ss === se? 1 : Math.abs(se - ss),
      //   start = se - length;
      //
      // that.undoManager.action({
      //   add: '',
      //   del: this.textContent.slice(start, se),
      //   start: start
      // });
      //
      break;
    case 9: // Tab
      // if(!cmdOrCtrl) {
      //   that.action('indent', {
      //     inverse: evt.shiftKey
      //   });
      //   return false;
      // }
      break;
    case 13:
      action('newline');
      evt.preventDefault();
      return false;
    case 90:
      // if(cmdOrCtrl) {
      //   that.undoManager[evt.shiftKey? 'redo' : 'undo']();
      //   return false;
      // }

      break;
    case 191:
      // if(cmdOrCtrl && !evt.altKey) {
      //   that.action('comment', { lang: this.id });
      //   return false;
      // }

      break;
  }
};

function action(act, opts){
  var p = el;
  opts = opts || {};
  var text = p.textContent;
  var start = opts.start || p.selectionStart;
  var end = opts.end || p.selectionEnd;

  var state = {
    start: start,
    end: end,
    before: text.slice(0, start),
    after: text.slice(end),
    sel: text.slice(start, end)
  };

  var a = actions[act](state, opts);

  p.textContent = state.before + state.sel + state.after;

  p.setSelectionRange(state.start, state.end);
  p.onkeyup();
}

var actions = {
  newline: function(state, options){//NB leading newline goes weird
    var s = state.start;
    state.before += '\n';

    var sel = state.sel;
    state.sel = '';

    state.start += 1;
    state.end = state.start;

    return { add: '\n', del: sel, start: s };
  }
};


el.onkeyup();
