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
- ✅ API usage analytics (bonus feature)

## Project Structure

```
/src
  /config         # Cache and Swagger configuration
  /controllers    # Request handlers
  /middlewares    # Auth, rate limiting, error handling
  /routes         # API route definitions
  /services       # Business logic and blockchain interaction
  /utils          # Logger, validators, blockchain utilities
/tests
  /unit          # Unit tests
  /integration   # Integration tests
```

## Running on WSL2 Ubuntu

### 1. Prerequisites

Ensure WSL2 and Ubuntu are properly installed:

```bash
# Check WSL version
wsl -l -v

# Update Ubuntu package manager
sudo apt update && sudo apt upgrade -y
```

### 2. Install Required Software

#### Install Node.js and npm

```bash
# Install Node.js (using NodeSource repository for latest LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

#### Install Git

```bash
sudo apt install git -y
git --version
```

#### (Optional) Install Redis

```bash
# If you want to use Redis caching
sudo apt install redis-server -y
sudo service redis-server start

# Check Redis status
sudo service redis-server status
```

### 3. Install Dependencies

```bash
# Install all npm packages
npm install

# If you encounter permission issues
npm cache clean --force
```

### 4. Configuration

```bash
# Edit environment variables
nano .env

# Modify API_KEYS to your own keys
# API_KEYS=my-secure-key-1,my-secure-key-2

# Save and exit
```

### 5. Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 6. Test the API

In a new terminal window:

```bash
# Health check
curl http://localhost:3000/health

# Get CRO balance (use your API key from .env)
curl -X GET http://localhost:3000/api/v1/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f89026 \
  -H "x-api-key: test-api-key-1"

# Get token balance
curl -X GET http://localhost:3000/api/v1/token-balance/0x742d35Cc6634C0532925a3b844Bc9e7595f89026/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 \
  -H "x-api-key: test-api-key-1"
```

### 7. Access from Windows

To access the API from Windows browser:

```bash
# Get WSL2 IP address
hostname -I

# Or use localhost directly (WSL2 usually forwards automatically)
# In Windows browser, visit:
# http://localhost:3000/api-docs
```

### 8. Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode (auto-rerun on file changes)
npm run test:watch
```

### 9. Using Docker (Optional)

Install and use Docker in WSL2:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Re-login or run
newgrp docker

# Build and run with Docker Compose
docker-compose up
```

## Troubleshooting

### npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Port already in use

```bash
# Check port usage
sudo lsof -i :3000

# Or change PORT in .env
PORT=3001
```

### Redis connection fails

```bash
# Ensure Redis is running
sudo service redis-server start

# Or set USE_REDIS=false in .env to use memory cache
```

### WSL2 network issues

```bash
# Restart WSL2 network
wsl --shutdown
# Then reopen WSL2 terminal
```

### Permission issues

```bash
# If you encounter EACCES errors
sudo chown -R $(whoami) ~/cronos-blockchain-api
```

## API Endpoints

### Get Native CRO Balance

```bash
GET /api/v1/balance/:address
```

**Headers:**
- `x-api-key`: Your API key (required)

**Example Request:**
```bash
curl -X GET http://localhost:3000/api/v1/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f89026 \
  -H "x-api-key: your-api-key"
```

**Example Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f89026",
  "balance": "123.456789",
  "symbol": "CRO",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get CRC20 Token Balance

```bash
GET /api/v1/token-balance/:address/:tokenAddress
```

**Headers:**
- `x-api-key`: Your API key (required)

**Example Request:**
```bash
curl -X GET http://localhost:3000/api/v1/token-balance/0x742d35Cc6634C0532925a3b844Bc9e7595f89026/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 \
  -H "x-api-key: your-api-key"
```

**Example Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f89026",
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "balance": "1000.50",
  "decimals": 18,
  "symbol": "USDC",
  "name": "USD Coin",
  "rawBalance": "1000500000000000000000",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Health Check

```bash
GET /health
```

No authentication required.

## Complete Testing Flow

```bash
# 1. Start the server
npm run dev

# 2. In another terminal, test the API
# Health check
curl http://localhost:3000/health

# Get CRO balance (replace with your API key)
curl -X GET "http://localhost:3000/api/v1/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f89026" \
  -H "x-api-key: test-api-key-1" | json_pp

# Test invalid address (should return 400 error)
curl -X GET "http://localhost:3000/api/v1/balance/invalid-address" \
  -H "x-api-key: test-api-key-1"

# Test without API key (should return 401 error)
curl -X GET "http://localhost:3000/api/v1/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f89026"

# 3. View Swagger documentation
# Open in Windows browser: http://localhost:3000/api-docs
```

## VS Code Remote Development (Recommended)

```bash
# Open VS Code in WSL2
code .

# This will open VS Code in Windows connected to WSL2
# Install recommended extensions:
# - ESLint
# - Prettier
# - Jest
# - Thunder Client (for API testing)
```

## API Documentation

Swagger documentation is available at:
```
http://localhost:3000/api-docs
```

## Authentication

All API endpoints (except health check) require authentication via API key.

Include your API key in the request headers:
```
x-api-key: your-api-key
```

API keys are configured in the `.env` file as a comma-separated list.

## Rate Limiting

- Default: 100 requests per hour per API key
- Configurable via environment variables
- Rate limit headers included in responses

## Caching

- Default: In-memory caching using node-cache
- TTL: 5 minutes (configurable)
- Optional: Redis support for distributed caching

To enable Redis:
1. Set `USE_REDIS=true` in `.env`
2. Configure `REDIS_URL`

## Running Tests

Run all tests with coverage:
```bash
npm test
```

Watch mode for development:
```bash
npm run test:watch
```

## Docker Support

### Using Docker

Build the image:
```bash
docker build -t cronos-api .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env cronos-api
```

### Using Docker Compose

```bash
docker-compose up
```

This will start the API and Redis (if enabled).

## Error Handling

The API provides structured error responses:

- `400`: Validation errors (invalid addresses)
- `401`: Authentication errors (missing/invalid API key)
- `429`: Rate limit exceeded
- `500`: Internal server errors
- `503`: Service unavailable (RPC connection issues)

## Monitoring and Logging

- Winston logger for structured logging
- Configurable log levels
- Request/response logging
- Error tracking

## Security Features

- Helmet.js for security headers
- CORS support
- Input validation with Joi
- API key authentication
- Rate limiting

## Performance Optimizations

- Response caching
- Efficient RPC calls
- Concurrent token data fetching
- Configurable cache TTL

## CI/CD (GitHub Actions)

The project includes a GitHub Actions workflow for continuous integration. See `.github/workflows/ci.yml` for details.

## Production Considerations

1. Use strong, unique API keys
2. Configure appropriate rate limits
3. Set up monitoring and alerting
4. Use Redis for distributed caching
5. Configure proper RPC endpoints
6. Set up SSL/TLS termination
7. Implement request logging and analytics
8. Regular security updates

## Analytics (Bonus Feature)

The API includes basic usage analytics per API key. To view analytics:

1. Track requests automatically (already implemented)
2. Create analytics endpoints (future enhancement)
3. Generate usage reports
4. Set up monitoring dashboards

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `API_KEYS` | Comma-separated API keys | test-api-key-1,test-api-key-2 |
| `CRONOS_RPC_URL` | Cronos RPC endpoint | https://evm.cronos.org |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | 3600000 (1 hour) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `CACHE_TTL_SECONDS` | Cache TTL in seconds | 300 (5 minutes) |
| `USE_REDIS` | Enable Redis caching | false |
| `REDIS_URL` | Redis connection URL | redis://localhost:6379 |
