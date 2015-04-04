
var actions = {
  'newline': function(state, options){
    var s = state.start;
    var lf = state.before.lastIndexOf('\n') + 1;
    var afterLf = state.before.slice(lf);
    var indent = afterLf.match(/^\s*/)[0];
    var cl = '';

    if(/^ {0,3}$/.test(indent)){ // maybe list
      var l = afterLf.slice(indent.length);
      if(/^[*+\-]\s+/.test(l)){
        cl += l.match(/^[*+\-]\s+/)[0];
      }else if(/^\d+\.\s+/.test(l)){
        cl += l.match(/^\d+\.\s+/)[0]
                .replace(/^\d+/, function(n){ return +n+1; });
      }else if(/^>/.test(l)){
        cl += l.match(/^>\s*/)[0];
      }
    }

    indent += cl;

    state.before += '\n' + indent;

    var sel = state.sel;
    state.sel = '';

    state.start += 1 + indent.length;
    state.end = state.start;

    return { add: '\n' + indent, del: sel, start: s };
  },

  'indent': function(state, options){
    var lf = state.before.lastIndexOf('\n') + 1;

    // TODO deal with soft tabs

    if(options.inverse){
      if(/\s/.test(state.before.charAt(lf))){
        state.before = spliceString(state.before, lf, 1);
        state.start -= 1;
      }
      state.sel = state.sel.replace(/\r?\n(?!\r?\n)\s/, '\n');
    }else if(state.sel || options.ctrl){
      state.before = spliceString(state.before, lf, 0, '\t');
      state.sel = state.sel.replace(/\r?\n/, '\n\t');
      state.start += 1;
    }else{
      state.before += '\t';
      state.start += 1;
      state.end  += 1;

      return { add: '\t', del: '', start: state.start - 1 };
    }

    state.end = state.start + state.sel.length;

    return {
      action: 'indent',
      start: state.start,
      end: state.end,
      inverse: options.inverse
    };
  }
};
