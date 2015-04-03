var md = (function(){
  var md = {
    comment: Prism.languages.markup.comment
  };

  function shallowClone(obj){
    var out = {};
    for(var i in obj) out[i] = obj[i];
    return out;
  }

  function merge(into){
    for(var i = 1; i < arguments.length; i += 1){
      var o = arguments[i];
      for(var j in o) into[j] = o[i];
    }
  }

  var inlines = {};
  var blocks = {};

  function inline(name, def){
    blocks[name] = inlines[name] = md[name] = def;
  }
  function block(name, def){
    blocks[name] = md[name] = def;
  }


  var langAliases = {
    markup: [ 'markup', 'html', 'xml' ],
    javascript: [ 'javascript', 'js' ]
  };

  for(var i in Prism.languages){
    if(!Prism.languages.hasOwnProperty(i)) continue;
    var l = Prism.languages[i];
    if(typeof l === 'function') continue;

    var aliases = langAliases[i];
    var matches = aliases ? aliases.join('|') : i;

    block('code-block fenced ' + i, {
      pattern: new RegExp('(^ {0,3}|\\n {0,3})(([`~])\\3\\3) *(' + matches + ')( [^`\n]*)? *\\n(?:[\\s\\S]*?)\\n {0,3}(\\2\\3*(?= *\\n)|$)', 'gi'),
      lookbehind: true,
      inside: {
        'code-language': {
          pattern: /(^([`~])\2+)((?!\2)[^\2\n])+/,
          lookbehind: true
        },
        'marker code-fence start': /^([`~])\1+/,
        'marker code-fence end': /([`~])\1+$/,
        'code-inner': {
          pattern: /(^\n)[\s\S]*(?=\n$)/,
          lookbehind: true,
          alias: 'language-' + i,
          inside: l
        }
      }
    });
  }


  block('code-block fenced', {
    pattern: /(^ {0,3}|\n {0,3})(([`~])\3\3)[^`\n]*\n(?:[\s\S]*?)\n {0,3}(\2\3*(?= *\n)|$)/g,
    lookbehind: true,
    inside: {
      'code-language': {
        pattern: /(^([`~])\2+)((?!\2)[^\2\n])+/,
        lookbehind: true
      },
      'marker code-fence start': /^([`~])\1+/,
      'marker code-fence end': /([`~])\1+$/,
      'code-inner': {
        pattern: /(^\n)[\s\S]*(?=\n$)/,
        lookbehind: true
      }
    }
  });


  block('heading setext-heading heading-1', {
    pattern: /^ {0,3}[^\s].*\n {0,3}=+[ \t]*$/gm,
    inside: {
      'marker heading-setext-line': {
        pattern: /^( {0,3}[^\s].*\n) {0,3}=+[ \t]*$/gm,
        lookbehind: true
      },
      rest: inlines
    }
  });

  block('heading setext-heading heading-2', {
    pattern: /^ {0,3}[^\s].*\n {0,3}-+[ \t]*$/gm,
    inside: {
      'marker heading-setext-line': {
        pattern: /^( {0,3}[^\s].*\n) {0,3}-+[ \t]*$/gm,
        lookbehind: true
      },
      rest: inlines
    }
  });

  var headingInside = {
    'marker heading-hash start': /^ *#+ */,
    'marker heading-hash end': / +#+ *$/,
    rest: inlines
  };
  for(var i = 1; i <= 6; i += 1){
    block('heading heading-'+i, {
      pattern: new RegExp('^ {0,3}#{'+i+'}(?!#).*$', 'gm'),
      inside: headingInside
    });
  }



  var linkText = {
    pattern: /^\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]/,
    inside: {
      'link-text-inner': {
        pattern: /^(\[)(.|\s)*?(?=\]$)/,
        lookbehind: true,
        inside: inlines
      },
      'marker bracket start': /^\[/,
      'marker bracket end': /\]$/
    }
  };

  var linkLabel = {
    pattern: /\[(?:\\.|[^\]])*\]/,
    inside: {
      'link-label-inner': {
        pattern: /^(\[)(.|\s)*?(?=\]$)/,
        lookbehind: true
      },
      'marker bracket start': /^\[/,
      'marker bracket end': /\]$/
    }
  };

  var imageText = {
    pattern: /^!\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]/,
    inside: {
      'marker image-bang': /^!/,
      'image-text-inner': {
        pattern: /^(\[)(.|\s)*?(?=\]$)/,
        lookbehind: true,
        inside: inlines
      },
      'marker bracket start': /^\[/,
      'marker bracket end': /\]$/
    }
  };

  var linkURL = {
    pattern: /^(\s*)(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))+/,
    lookbehind: true
  };

  var linkBracedURL = {
    pattern: /^(\s*)<(?:\\.|[^<>\n])*>/,
    lookbehind: true,
    inside: {
      'braced-href-inner': {
        pattern: /^(<)(.|\s)*?(?=>$)/,
        lookbehind: true
      },
      'marker brace start': /^</,
      'marker brace end': />$/
    }
  };

  var linkTitle = {
    pattern: /('(?:\\'|[^'])+'|"(?:\\"|[^"])+")\s*$/,
    // lookbehind: true,
    inside: {
      'title-inner': {
        pattern: /^(['"])(.|\s)*?(?=\1$)/,
        lookbehind: true
      },
      'marker quote start': /^['"]/,
      'marker quote end': /['"]$/
    }
  };

  var linkParams = {
    pattern: /\( *(?:(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))*|<(?:[^<>\n]|\\.)*>)( +('(?:[^']|\\')+'|"(?:[^"]|\\")+"))? *\)/,
    inside: {
      'link-params-inner': {
        pattern: /^(\(\s*)(.|\n)*?(?=\s*\)$)/,
        lookbehind: true,
        inside: {
          'link-title': linkTitle,
          'href': linkURL,
          'braced-href': linkBracedURL
        }
      },
      'marker bracket start': /^\(/,
      'marker bracket end': /\)$/
    }
  };




  block('hr', {
    pattern: /^[\t ]*([*\-_])([\t ]*\1){2,}([\t ]*$)/gm,
    inside: {
      'marker hr-marker': /[*\-_]/g
    }
  });

  block('urldef', {
    pattern: /^( {0,3})\[(?:\\.|[^\]])+]: *\n? *(?:(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))*|<(?:[^<>\n]|\\.)*>)( *\n? *('(?:\\'|[^'])+'|"(?:\\"|[^"])+"))?$/gm,
    lookbehind: true,
    inside: {
      'link-label': linkLabel,
      'marker urldef-colon': /^:/,
      'link-title': linkTitle,
      'href': linkURL,
      'braced-href': linkBracedURL
    }
  });

  block('blockquote', {
    pattern: /^[\t ]*>[\t ]?.+(?:\n(?!\n)|.)*/gm,
    inside: {
      'marker quote-marker': /^[\t ]*>[\t ]?/gm,
      'blockquote-content': {
        pattern: /[^>]+/,
        rest: blocks
      }
    }
  });

  block('list', {
    pattern: /^[\t ]*([*+\-]|\d+\.)[\t ].+(?:\n(?!\n)|.)*/gm,
    inside: {
      li: {
        pattern: /^[\t ]*([*+\-]|\d+\.)[\t ].+(?:\n|[ \t]+[^*+\- \t].*\n)*/gm,
        inside: {
          'marker list-item': /^[ \t]*([*+\-]|\d+\.)[ \t]/m,
          rest: blocks
        }
      }
    }
  });

  block('code-block', {
    pattern: /(^|(?:^|(?:^|\n)(?![ \t]*([*+\-]|\d+\.)[ \t]).*\n)\s*?\n)((?: {4}|\t).*(?:\n|$))+/g,
    lookbehind: true
  });

  block('p', {
    pattern: /.+/g,
    inside: inlines
  });

  inline('image', {
    pattern: /!\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]\(\s*(?:(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))*|<(?:[^<>\n]|\\.)*>)(\s+('(?:[^']|\\')+'|"(?:[^"]|\\")+"))?\s*\)/,
    inside: {
      'link-text': imageText,
      'link-params': linkParams
    }
  });

  inline('link', {
    pattern: /\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]\(\s*(?:(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))*|<(?:[^<>\n]|\\.)*>)(\s+('(?:[^']|\\')+'|"(?:[^"]|\\")+"))?\s*\)/,
    inside: {
      'link-text': linkText,
      'link-params': linkParams
    }
  });

  inline('image image-ref', {
    pattern: /!\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\] ?\[(?:\\.|[^\]])*\]/,
    inside: {
      'link-text': imageText,
      'link-label': linkLabel
    }
  });
  inline('link link-ref', {
    pattern: /\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\] ?\[(?:\\.|[^\]])*\]/,
    inside: {
      'link-text': linkText,
      'link-label': linkLabel
    }
  });

  inline('image image-ref shortcut-ref', {
    pattern: /!\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]/,
    inside: {
      'marker image-bang': /^!/,
      'link-text': linkText
    }
  });
  inline('link link-ref shortcut-ref', {
    pattern: /\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]/,
    inside: {
      'link-text': linkText
    }
  });


  inline('code', {
    pattern: /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/g,
    lookbehind: true,
    inside: {
      'code-inner': {
        pattern: /^(`)(.|\s)*(?=`$)/,
        lookbehind: true
      },
      'marker code-marker start': /^`/,
      'marker code-marker end': /`$/
    }
  });

  inline('strong', {
    pattern: /(^|[^\\*_])([_\*])\2(?:\n(?!\n)|.)+?\2{2}(?!\2)/g,
    // pattern: /(^|[^\\])(\*\*|__)(?:\n(?!\n)|.)+?\2/,
    lookbehind: true,
    inside: {
      'strong-inner': {
        pattern: /^(\*\*|__)(.|\s)*?(?=\1$)/,
        lookbehind: true,
        inside: inlines
      },
      'marker strong-marker start': /^(\*\*|__)/,
      'marker strong-marker end': /(\*\*|__)$/
    }
  });

  inline('em', {
    // pattern: /(^|[^\\])(\*|_)(\S[^\2]*?)??[^\s\\]+?\2/g,
    pattern: /(^|[^\\*_])(\*|_)(?:\n(?!\n)|.)+?\2(?!\2)/g,
		lookbehind: true,
    inside: {
      'em-inner': {
        pattern: /^(\*|_)(.|\s)*?(?=\1$)/,
        lookbehind: true,
        inside: inlines
      },
      'marker em-marker start': /^(\*|_)/,
      'marker em-marker end': /(\*|_)$/
    }
  });

  inline('strike', {
    pattern: /(^|\n|\W)(~~)(?=\S)([^\r]*?\S)\2/gm,
    lookbehind: true,
    inside: {
      'strike-inner': {
        pattern: /^(~~)(.|\s)*(?=~~$)/,
        lookbehind: true,
        inside: inlines
      },
      'marker strike-marker start': /^~~/,
      'marker strike-marker end': /~~$/
    }
  });

  // md.nl = /^\n$/gm;

/*

  function addInside(wat, def){
    if(!wat.inside) wat.inside = {};
    wat.inside.rest = def;
  }


  var inlines = {
    strong: md.strong,
    em: md.em,
    strike: md.strike,
    code: md.code,
    link: md.link,
    image: md.image,
    'image image-ref': md['image image-ref'],
    'link link-ref': md['link link-ref']
  };
/*
  var blocks = {
    list: md.list,
    blockquote: md.blockquote
  };
  merge(blocks, inlines);

  addInside(md.blockquote.inside['blockquote-content'], blocks);
  addInside(md.list.inside.li, blocks);

  for(var i = 1; i <= 6; i += 1){
    addInside(md['heading heading-'+i], inlines);
  }
  addInside(md['heading setext-heading heading-1'], inlines);
  addInside(md['heading setext-heading heading-2'], inlines);

  addInside(md.strike.inside['strike-inner'], inlines);


  var linkInlines = shallowClone(inlines);
  delete linkInlines.link;
  delete linkInlines['link link-ref'];
  addInside(linkText.inside['link-text-inner'], linkInlines);

  var imgInlines = shallowClone(linkInlines);
  delete imgInlines.image;
  delete imgInlines['image image-ref'];
  addInside(imageText.inside['image-text-inner'], imgInlines);


  // Nesting em and strong goes a bit mental :( this is best I can manage
  var emInlines = shallowClone(inlines);
  delete emInlines.em;
  delete emInlines.strong;
  addInside(md.strong.inside['strong-inner'], emInlines);
  addInside(md.em.inside['em-inner'], emInlines);

  md.strong.inside['strong-inner'].inside.em = md.em;
  md.em.inside['em-inner'].inside.strong = md.strong;

*/

  inline('comment', Prism.languages.markup.comment);
  inline('tag', Prism.languages.markup.tag);
  inline('entity', Prism.languages.markup.entity);

  return md;
})();
(function(){

Object.defineProperty(HTMLPreElement.prototype, 'selectionStart', {
	get: function() {
		var selection = getSelection();

		if(selection.rangeCount) {
			var range = selection.getRangeAt(0),
				element = range.startContainer,
				container = element,
				offset = range.startOffset;

			if(!(this.compareDocumentPosition(element) & 0x10)) {
				return 0;
			}

			do {
				while(element = element.previousSibling) {
					if(element.textContent) {
						offset += element.textContent.length;
					}
				}

				element = container = container.parentNode;
			} while(element && element != this);

			return offset;
		}
		else {
			return 0;
		}
	},

	enumerable: true,
	configurable: true
});

Object.defineProperty(HTMLPreElement.prototype, 'selectionEnd', {
	get: function() {
		var selection = getSelection();

		if(selection.rangeCount) {
			return this.selectionStart + (selection.getRangeAt(0) + '').length;
		}
		else {
			return 0;
		}
	},

	enumerable: true,
	configurable: true
});

HTMLPreElement.prototype.setSelectionRange = function(ss, se) {
	var range = document.createRange(),
	    offset = findOffset(this, ss);

	range.setStart(offset.element, offset.offset);

	if(se && se != ss) {
		offset = findOffset(this, se);
	}

	range.setEnd(offset.element, offset.offset);

	var selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

function findOffset(root, ss) {
	if(!root) {
		return null;
	}

	var offset = 0,
		element = root;

	do {
		var container = element;
		element = element.firstChild;

		if(element) {
			do {
				var len = element.textContent.length;

				if(offset <= ss && offset + len > ss) {
					break;
				}

				offset += len;
			} while(element = element.nextSibling);
		}

		if(!element) {
			// It's the container's lastChild
			break;
		}
	} while(element && element.hasChildNodes() && element.nodeType != 3);

	if(element) {
		return {
			element: element,
			offset: ss - offset
		};
	}
	else if(container) {
		element = container;

		while(element && element.lastChild) {
			element = element.lastChild;
		}

		if(element.nodeType === 3) {
			return {
				element: element,
				offset: element.textContent.length
			};
		}
		else {
			return {
				element: element,
				offset: 0
			};
		}
	}

	return {
		element: root,
		offset: 0,
		error: true
	};
}

})();

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
