ACCOUNT := 679733785443
REGION  := ap-southeast-1

deploy: synth
	@account=${ACCOUNT} region=${REGION} cdk deploy \
		--all \
		--require-approval never \
		--outputs-file=stack.out.json

synth:
	@npm run build && account=${ACCOUNT} region=${REGION} cdk synth