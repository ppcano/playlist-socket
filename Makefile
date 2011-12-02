
SUITE2 = $(shell find test/ -name '*.lltest.js')
TESTS = $(shell find test/ -name '*.test.js')

REPORTER = spec
SLOW = 20
#reporter: dot spec TAP list 
test:

	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
	--reporter $(REPORTER) \
	--slow $(SLOW) \
	--ui bdd \
	--growl \
	$(TESTS)


#	@NODE_ENV=test expresso -s $(Serial_TESTS)  
#	@NODE_ENV=test expresso -s $(Long_Serial_TESTS) -t 10000  

log:
	@NODE_ENV=test echo 'testo is a proof ' 

  


.PHONY: test log
