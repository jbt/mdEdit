all: clean build

.DEFAULT: all
.PHONY: clean distclean

clean:
	rm -f mdedit*js

distclean: clean
	rm -rf compiler.jar

build: \
	mdedit.min.js

mdedit.js: \
	src/md.js \
	src/util.js \
	src/actions.js \
	src/SelectionManager.js \
	src/UndoManager.js \
	src/Editor.js \
	src/mdedit.js

compiler.jar:
	wget -O- https://dl.google.com/closure-compiler/compiler-latest.tar.gz | tar -xz compiler.jar

mdedit.min.js: \
	mdedit.js \
	compiler.jar \

	java -jar compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS < $< > $@

mdedit.js:
	@rm -f $@
	cat $^ > $@
