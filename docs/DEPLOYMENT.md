# WallyBot Production Deployment Guide

## 🚀 Production Setup

### Prerequisites
- Node.js 18+ 
- PM2 (for process management)
- Nginx (for reverse proxy)
- SSL certificate
- Domain name

### 1. Environment Configuration

Copy and configure the production environment:
```bash
cp .env.production .env
```

Update the following variables in `.env`:
```bash
# Required - Replace with your actual values
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+14155238886
NODIT_API_KEY=your_api_key
OPENAI_API_KEY=sk-proj-...
WEBHOOK_URL=https://yourdomain.com/webhook
```

### 2. Install Dependencies
```bash
npm ci --only=production
```

### 3. Create Logs Directory
```bash
mkdir -p logs
chmod 755 logs
```

### 4. Process Management with PM2

Install PM2 globally:
```bash
npm install -g pm2
```

Start the application:
```bash
npm run pm2:start
```

Useful PM2 commands:
```bash
npm run pm2:stop      # Stop the application
npm run pm2:restart   # Restart the application
npm run pm2:logs      # View logs
pm2 monit             # Monitor processes
pm2 save              # Save PM2 configuration
pm2 startup           # Generate startup script
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/wallybot`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=webhook:10m rate=10r/m;
    
    location / {
        limit_req zone=webhook burst=5 nodelay;
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/wallybot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Docker Deployment (Alternative)

Build production image:
```bash
docker build -f Dockerfile.prod -t wallybot:production .
```

Run with Docker Compose:
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  wallybot:
    image: wallybot:production
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
    volumes:
      - ./logs:/app/logs
```

Start:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 7. Monitoring & Maintenance

#### Log Monitoring
```bash
# View real-time logs
npm run pm2:logs

# View error logs
tail -f logs/error.log

# View combined logs
tail -f logs/combined.log
```

#### System Monitoring
```bash
# Check application status
pm2 status

# Monitor system resources
pm2 monit

# Check health endpoint
curl https://yourdomain.com/health
```

#### Performance Optimization
1. **Rate Limiting**: Configured in Nginx and application
2. **Clustering**: PM2 runs multiple instances
3. **Caching**: Environment variables for cache TTL
4. **Resource Limits**: PM2 memory restart at 1GB

### 8. Security Checklist

- ✅ HTTPS enabled with SSL certificate
- ✅ Twilio webhook signature verification enabled
- ✅ Rate limiting configured
- ✅ Security headers added
- ✅ Non-root user in Docker
- ✅ Environment variables secured
- ✅ Log rotation configured
- ✅ Health checks enabled

### 9. Backup & Recovery

#### Environment Backup
```bash
# Backup environment configuration
cp .env .env.backup.$(date +%Y%m%d)
```

#### Log Rotation
Configure logrotate in `/etc/logrotate.d/wallybot`:
```
/path/to/wallybot/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 wallybot wallybot
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 10. Troubleshooting

#### Common Issues
1. **Port 3000 in use**: Change PORT in .env
2. **Webhook signature failed**: Check TWILIO_AUTH_TOKEN
3. **Rate limit exceeded**: Upgrade Nodit API plan
4. **Memory issues**: Restart PM2 process

#### Debug Commands
```bash
# Check application logs
npm run pm2:logs

# Test webhook locally
curl -X POST https://yourdomain.com/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp%3A%2B1234567890&Body=help"

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## 📊 Monitoring Metrics

Monitor these key metrics:
- Response time < 2 seconds
- Error rate < 1%
- Memory usage < 512MB per process
- CPU usage < 70%
- Webhook signature validation 100%

## 🔄 Updates & Maintenance

1. **Code Updates**:
   ```bash
   git pull origin main
   npm ci --only=production
   npm run pm2:restart
   ```

2. **Dependency Updates**:
   ```bash
   npm audit fix --only=prod
   npm run pm2:restart
   ```

3. **Monitoring**:
   - Set up alerts for health check failures
   - Monitor API rate limits
   - Track error rates and response times
