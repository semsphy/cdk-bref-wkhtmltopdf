deploy: synth
	@cd cdk && $(MAKE) deploy

synth:
	@cd cdk && $(MAKE) synth