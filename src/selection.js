function SelectionManager(elt){
	this.elt = elt;
}

SelectionManager.prototype.getStart = function(){
	var selection = getSelection();

	if(!selection.rangeCount) return 0;

	var range = selection.getRangeAt(0);
	var el = range.startContainer();
	var container = el;
	var offset = range.startOffset;

	if(!(this.elt.compareDocumentPosition(el) & 0x10)){
		// selection is outside this element.
		return 0;
	}

	do{
		while((el = el.previousSibling)){
			if(el.textContent){
				offset += el.textContent.length;
			}
		}

		el = container = container.parentNode;
	}while(el && el !== this.elt);

	return offset;
};

SelectionManager.prototype.getEnd = function(){
	var selection = getSelection();

	if(!selection.rangeCount) return 0;

	return this.getStart() + String(selection.getRangeAt(0)).length;
};

SelectionManager.prototype.setRange = function(start, end){
	var range = document.createRange();
	var offset = findOffset(this.elt, start);

	range.setStart(offset.element, offset.offset);

	if(end && end !== start){
		offset = findOffset(this.elt, end);
	}

	range.setEnd(offset.element, offset.offset);

	var selection = getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
};






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
