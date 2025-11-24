build:
	npm run build

deploy: build
	@echo "Update Makefile with your deployment target"
	# aws s3 sync dist s3://your-bucket-name
