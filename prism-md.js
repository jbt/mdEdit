Prism.languages.md = (function(){
  var md = {};

  function shallowClone(obj){
    var out = {};
    for(var i in obj) out[i] = obj[i];
    return out;
  }



  md['heading setext-heading heading-1'] = {
    pattern: /^ {0,3}[^\s].*\n {0,3}=+[ \t]*$/gm,
    inside: {
      'marker heading-setext-line': {
        pattern: /^( {0,3}[^\s].*\n) {0,3}=+[ \t]*$/gm,
        lookbehind: true
      }
    }
  };

  md['heading setext-heading heading-2'] = {
    pattern: /^ {0,3}[^\s].*\n {0,3}-+[ \t]*$/gm,
    inside: {
      'marker heading-setext-line': {
        pattern: /^( {0,3}[^\s].*\n) {0,3}-+[ \t]*$/gm,
        lookbehind: true
      }
    }
  };

  var headingInside = {
    'marker heading-hash start': /^ *#+ */,
    'marker heading-hash end': / +#+ *$/
  };
  for(var i = 1; i <= 6; i += 1){
    md['heading heading-'+i] = {
      pattern: new RegExp('^ {0,3}#{'+i+'}(?!#).*$', 'gm'),
      inside: headingInside
    };
  }


  md.hr = {
    pattern: /^[\t ]*([*\-_])([\t ]*\1){2,}([\t ]*$)/gm,
    inside: {
      'marker hr-marker': /[*\-_]/g
    }
  };

  md.list = {
    pattern: /^[\t ]*([*+\-]|\d+\.)[\t ].+(?:\n(?!\n)|.)*/gm,
    inside: {
      li: {
        pattern: /^[\t ]*([*+\-]|\d+\.)[\t ].+(?:\n|[ \t]?[^*+\-].*\n)*/gm,
        inside: {
          'marker list-item': /^[ \t]*([*+\-]|\d+\.)[ \t]/m
        }
      }
    }
  };


  md.code = {
    pattern: /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/g,
    lookbehind: true,
    inside: {
      'code-inner': {
        pattern: /^(`).*(?=`$)/,
        lookbehind: true
      },
      'marker code-marker start': /^`/,
      'marker code-marker end': /`$/
    }
  };

  var linkText = {
    pattern: /^!?\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]/,
    inside: {
      'marker image-bang': /^!/,
      'link-text-inner': {
        pattern: /^(\[).*?(?=\]$)/,
        lookbehind: true
      },
      'marker bracket start': /^\[/,
      'marker bracket end': /\]$/
    }
  };

  var linkURL = {
    pattern: /^(\s*)(?!<)(?:\\.|[^\(\)]|\([^\(\)]*\))*/,
    lookbehind: true
  };

  var linkBracedURL = {
    pattern: /^(\s*)<(?:[^<>]|\\.)*>/,
    lookbehind: true,
    inside: {
      'braced-url-inner': {
        pattern: /^(<).*?(?=>$)/,
        lookbehind: true,
      },
      'marker brace start': /^</,
      'marker brace end': />$/
    }
  };

  var linkTitle = {
    pattern: /(\s+)('(?:[^']|\\')+'|"(?:[^"]|\\")+")/,
    lookbehind: true,
    inside: {
      'title-inner': {
        pattern: /^(['"]).*?(?=\1$)/,
        lookbehind: true,
      },
      'marker quote start': /^['"]/,
      'marker quote end': /['"]$/
    }
  };

  var linkParams = {
    pattern: /\(\s*(?:(?!<)(?:\\.|[^\(\)]|\([^\(\)]*\))*|<(?:[^<>]|\\.)*>)(\s+('(?:[^']|\\')+'|"(?:[^"]|\\")+"))?\s*\)/,
    inside: {
      'link-params-inner': {
        pattern: /^(\().*?(?=\)$)/,
        lookbehind: true,
        inside: {
          'url': linkURL,
          'braced-url': linkBracedURL,
          'link-title': linkTitle
        }
      },
      'marker bracket start': /^\(/,
      'marker bracket end': /\)$/
    }
  };

  md.image = {
    pattern: /!\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]\(\s*(?:(?!<)(?:\\.|[^\(\)]|\([^\(\)]*\))*|<(?:[^<>]|\\.)*>)(\s+('(?:[^']|\\')+'|"(?:[^"]|\\")+"))?\s*\)/,
    inside: {
      'link-text': linkText,
      'link-params': linkParams
    }
  };

  md.link = {
    pattern: /\[(?:\\.|[^\[\]]|\[[^\[\]]*\])*\]\(\s*(?:(?!<)(?:\\.|[^\(\)]|\([^\(\)]*\))*|<(?:[^<>]|\\.)*>)(\s+('(?:[^']|\\')+'|"(?:[^"]|\\")+"))?\s*\)/,
    inside: {
      'link-text': linkText,
      'link-params': linkParams
    }
  };


  md.strong = {
    pattern: /(^|[^\\*_])([_\*])\2(?:\n(?!\n)|.)+?\2{2}(?!\2)/g,
    // pattern: /(^|[^\\])(\*\*|__)(?:\n(?!\n)|.)+?\2/,
    lookbehind: true,
    inside: {
      'strong-inner': {
        pattern: /^(\*\*|__).*?(?=\1$)/,
        lookbehind: true
      },
      'marker strong-marker start': /^(\*\*|__)/,
      'marker strong-marker end': /(\*\*|__)$/
    }
  };

  md.em = {
    // pattern: /(^|[^\\])(\*|_)(\S[^\2]*?)??[^\s\\]+?\2/g,
    pattern: /(^|[^\\*_])(\*|_)(?:\n(?!\n)|.)+?\2(?!\2)/g,
		lookbehind: true,
    inside: {
      'em-inner': {
        pattern: /^(\*|_).*?(?=\1$)/,
        lookbehind: true
      },
      'marker em-marker start': /^(\*|_)/,
      'marker em-marker end': /(\*|_)$/
    }
  };

  md.strike = {
    pattern: /(^|\n|\W)(~~)(?=\S)([^\r]*?\S)\2/gm,
    lookbehind: true,
    inside: {
      'strike-inner': {
        pattern: /^(~~).*(?=~~$)/,
        lookbehind: true
      },
      'marker strike-marker start': /^~~/,
      'marker strike-marker end': /~~$/
    }
  };

  md.nl = /^\n$/gm;



  function addInside(wat, def){
    if(!wat.inside) wat.inside = {};
    wat.inside.rest = def;
  }


  var inlines = {
    strong: md.strong,
    em: md.em,
    strike: md.strike,
    code: md.code
  };

  for(var i = 1; i <= 6; i += 1){
    addInside(md['heading heading-'+i], inlines);
  }
  addInside(md['heading setext-heading heading-1'], inlines);
  addInside(md['heading setext-heading heading-2'], inlines);

  addInside(md.list.inside.li/*.inside['list-item-inner']*/, inlines);
  addInside(md.strike.inside['strike-inner'], inlines);


  // Nesting em and strong goes a bit mental :( this is best I can manage
  inlines = shallowClone(inlines);
  delete inlines.em;
  delete inlines.strong;
  addInside(md.strong.inside['strong-inner'], inlines);
  addInside(md.em.inside['em-inner'], inlines);

  md.strong.inside['strong-inner'].inside.em = md.em;
  md.em.inside['em-inner'].inside.strong = md.strong;



  return md;
})();
