
smoke-extension:
	@cd extension && npm run smoke
	@cd extension && npm run smoke:policy

verify-extension:
	@echo "✅ Verifying extension: build + typecheck + smoke"
	@$(MAKE) build-extension
	@$(MAKE) typecheck-extension
	@$(MAKE) smoke-extension
	@echo "🎉 verify-extension complete"
