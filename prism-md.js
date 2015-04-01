Prism.languages.md = (function(){
  var md = {};

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
  function leafBlock(name, def){
    md[name] = def;
  }


  leafBlock('code-block fenced', {
    pattern: /(^ {0,3}|\n {0,3})(`{3,})[^`\n]*\n(?:[\s\S]*?)\n {0,3}(\2`*(?= *\n)|$)/g,
    lookbehind: true,
    inside: {
      'code-language': {
        pattern: /(^`+)[^`\n]+/,
        lookbehind: true
      },
      'marker code-fence start': /^`+/,
      'marker code-fence end': /`+$/,
      'code-inner': {
        pattern: /(^\n)[\s\S]*(?=\n$)/,
        lookbehind: true
      }
    }
  });


  leafBlock('heading setext-heading heading-1', {
    pattern: /^ {0,3}[^\s].*\n {0,3}=+[ \t]*$/gm,
    inside: {
      'marker heading-setext-line': {
        pattern: /^( {0,3}[^\s].*\n) {0,3}=+[ \t]*$/gm,
        lookbehind: true
      },
      rest: inlines
    }
  });

  leafBlock('heading setext-heading heading-2', {
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
    leafBlock('heading heading-'+i, {
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
        lookbehind: true,
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
        lookbehind: true,
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
          'braced-href': linkBracedURL,
        }
      },
      'marker bracket start': /^\(/,
      'marker bracket end': /\)$/
    }
  };




  leafBlock('hr', {
    pattern: /^[\t ]*([*\-_])([\t ]*\1){2,}([\t ]*$)/gm,
    inside: {
      'marker hr-marker': /[*\-_]/g
    }
  });

  leafBlock('urldef', {
    pattern: /^( {0,3})\[(?:\\.|[^\]])+]: *\n? *(?:(?!<)(?:\\.|[^\(\)\s]|\([^\(\)\s]*\))*|<(?:[^<>\n]|\\.)*>)( *\n? *('(?:\\'|[^'])+'|"(?:\\"|[^"])+"))?$/gm,
    lookbehind: true,
    inside: {
      'link-label': linkLabel,
      'marker urldef-colon': /^:/,
      'link-title': linkTitle,
      'href': linkURL,
      'braced-href': linkBracedURL,
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

  leafBlock('code-block', {
    pattern: /(^|(?:^|(?:^|\n)(?![ \t]*([*+\-]|\d+\.)[ \t]).*\n)\s*?\n)((?: {4}|\t).*(?:\n|$))+/g,
    lookbehind: true
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

  return md;
})();
