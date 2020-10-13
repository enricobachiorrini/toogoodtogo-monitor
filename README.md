## Installation

### Make sure Redis is installed
On your computer or remotely. 
For instructions on how to install Redis, read [this](https://flaviocopes.com/redis-installation/).


### Installation
```bash
git clone https://github.com/enricobachiorrini/too-good-to-go-notification
cd too-good-to-go-notification
npm install
```

### Create .env file
Make sure to add the following keys:
```
EMAIL=XXX        # Too Good To Go email
PASSWORD=XXX     # Too Good To Go password
WEBHOOK=XXX      # Discord webhook
REDIS_URL=XXX    # redis://user:password@host:port or leave blank for default redis://localhost:6379
```
### Start the script
```bash
npm start
```