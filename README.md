# Cronos Blockchain API

A secure and performant Node.js backend API for interacting with the Cronos (EVM) blockchain to fetch native CRO and CRC20 token balances.

## Features

- ✅ Fetch native CRO token balance
- ✅ Fetch CRC20 token balances with metadata
- ✅ API key authentication
- ✅ Rate limiting (100 requests per hour per API key)
- ✅ In-memory caching with configurable TTL
- ✅ Input validation for Ethereum addresses
- ✅ Comprehensive error handling
- ✅ Swagger API documentation
- ✅ Unit and integration tests with Jest
- ✅ Production-ready logging with Winston
- ✅ Optional Redis support for caching
- ✅ Docker support

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Run the application:
```bash
npm run dev  # Development mode
npm start    # Production mode
```

4. Access API documentation:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Get Native CRO Balance
```bash
GET /api/v1/balance/:address
```

### Get CRC20 Token Balance
```bash
GET /api/v1/token-balance/:address/:tokenAddress
```

## Testing

```bash
npm test  # Run all tests with coverage
npm run test:watch  # Watch mode
```

## Docker

```bash
# Using Docker Compose
docker-compose up

# Manual build
docker build -t cronos-api .
docker run -p 3000:3000 --env-file .env cronos-api
```

## License

ISC
