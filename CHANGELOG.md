# Changelog

## [Unreleased]

### Security
- Fixed error handling in middleware to prevent unhandled promise rejections
- Improved input validation using Zod schemas consistently
- Enhanced demo login security with dynamic IDs instead of hardcoded values

### Performance
- Optimized database queries by replacing N+1 query patterns with joins
- Added database indexes to improve query performance
- Added composite index for whitelist lookups

### Code Quality
- Standardized authentication with consistent middleware
- Improved type safety by replacing `any` types with proper interfaces
- Enhanced error handling with centralized error middleware
- Moved hardcoded values to centralized configuration
- Added comprehensive environment variable validation
- Separated request logging into dedicated middleware

## [1.0.0] - Initial Release