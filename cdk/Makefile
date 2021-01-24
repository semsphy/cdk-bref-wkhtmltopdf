deploy: synth
	cdk deploy \
		--all \
		--require-approval never \
		--outputs-file=stack.out.json

synth:
	@npm run build && cdk synth