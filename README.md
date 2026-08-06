# VIPScale Alexa Skill — Gemini AI + ClickUp + Slack

An Alexa Custom Skill powered by **Google Gemini 2.0 Flash**, with voice-driven automation for **ClickUp** and **Slack**. Hosted on your own VPS via Express.js + HTTPS.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Edit `.env` and fill in your tokens:
```
ALEXA_SKILL_ID=amzn1.ask.skill.YOUR_SKILL_ID
CLICKUP_API_TOKEN=your_clickup_token
CLICKUP_LIST_ID=your_list_id
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_ID=C1234567890
```

### 3. Generate SSL certificate (self-signed for dev)
```bash
npm run generate-cert
```
→ Creates `ssl/cert.pem` and `ssl/key.pem`

### 4. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 5. Verify it's running
```bash
curl -k https://localhost:3000/health
```

---

## 🔧 Alexa Developer Console Setup

1. Go to [developer.amazon.com/alexa/console/ask](https://developer.amazon.com/alexa/console/ask)
2. Click **Create Skill** → Custom → Provision your own
3. Under **Endpoint**:
   - Select **HTTPS**
   - Enter: `https://YOUR_VPS_IP_OR_DOMAIN:3000/alexa`
   - SSL Certificate type: **"I will upload a self-signed certificate in PEM format"**
   - Paste the content of `ssl/cert.pem`
4. Under **Interaction Model** → **JSON Editor**:
   - Paste the contents of `skill-package/interactionModel.json`
   - Click **Save Model** → **Build Model**
5. Test in the **Test** tab

---

## 🗣️ Voice Commands

| Say...                                  | Does...                              |
|-----------------------------------------|--------------------------------------|
| "Alexa, open vip scale"                 | Launches the skill                   |
| "ask Gemini what is machine learning"   | Answers via Gemini AI                |
| "add a task weekly report to ClickUp"   | Creates a ClickUp task               |
| "list my tasks"                         | Reads your open ClickUp tasks        |
| "send a message standup done to Slack"  | Posts to your Slack channel          |

---

## 🏭 Production Deployment

### Option A: Let's Encrypt (recommended for domain-based VPS)
```bash
# Install certbot and get a free trusted cert
sudo certbot certonly --standalone -d your-alexa-domain.com
# Then copy certs to ssl/
sudo cp /etc/letsencrypt/live/your-domain/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain/privkey.pem ssl/key.pem
```
In Alexa Developer Console, set SSL Certificate type to **"My development endpoint has a certificate from a trusted certificate authority"**.

### Option B: Nginx reverse proxy (port 80/443 → 3000)
```nginx
server {
    listen 443 ssl;
    server_name your-alexa-domain.com;
    ssl_certificate /etc/letsencrypt/live/your-domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain/privkey.pem;

    location /alexa {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Running with PM2
```bash
npm install -g pm2
pm2 start src/index.js --name vipscale-alexa
pm2 save
pm2 startup
```
