### Installation

```bash
git clone https://github.com/enricobachiorrini/too-good-to-go-monitor
cd too-good-to-go-monitor
npm install
```

### Create .env file

Make sure to add the following:

```
EMAIL=XXX        # Too Good To Go email
WEBHOOK=XXX      # Discord webhook to send notifications
```

### Start the script

```bash
npm run build
npm start
```

### Login

Open your email, and you should find an email from Too Good To Go with subjet "Continue your log in".
Click on the green "LOG ME IN" button. The link must be opened in a browser in order for this to work. If you're automatically redirected to the app upon clicking, manually copy the link and paste it in a browser.

<img src="https://i.ibb.co/X70NcdN/Continue-your-log-in.png" height=150px>

### Enjoy

Add the restaurants you want to monitor to your favorites. You will be getting a Discord notification when items are restocked or sold out.

<img src="https://i.ibb.co/SN0yQ64/Screen-Shot-2022-10-17-at-11-08-09.png" height="450px">

### Docker

```
docker build -t toogoodtogo-monitor .
docker run toogoodtogo-monitor
```
