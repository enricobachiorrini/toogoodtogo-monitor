const axios = require("axios");
const Discord = require("discord.js");
require("dotenv").config();

class TooGoodToGo {
  constructor({ email, password, webhook }) {
    this.email = email;
    this.password = password;
    this.webhookClient = new Discord.WebhookClient(
      webhook.split("/")[5],
      webhook.split("/")[6]
    );
    this.userId = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.favorites = [];
  }
  setUserId = (userId) => {
    this.userId = userId;
  };
  setAccessToken = (accessToken) => {
    this.accessToken = accessToken;
  };
  setRefreshToken = (refreshToken) => {
    this.refreshToken = refreshToken;
  };

  setFavorites = (favorites) => {
    this.favorites = favorites;
  };

  login = async () => {
    this.refreshToken
      ? await this.refreshAccessToken()
      : await this.loginByEmail();
  };

  loginByEmail = async () => {
    try {
      const { data } = await axios.post(
        "https://apptoogoodtogo.com/api/auth/v1/loginByEmail",
        {
          device_type: "IOS",
          email: this.email,
          password: this.password,
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "user-agent":
              "TooGoodToGo/20.9.2 (837) (iPhone/iPhone XS (Global); iOS 14.0; Scale/3.00)",
            "accept-language": "en-GB",
            "accept-encoding": "gzip;q=1.0, compress;q=0.5 ",
          },
        }
      );
      this.setAccessToken(data.access_token);
      this.setUserId(data.startup_data.user.user_id);
      this.setRefreshToken(data.refresh_token);
    } catch (err) {
      console.log(err.message);
    }
  };

  refreshAccessToken = async () => {
    try {
      const { data } = await axios.post(
        "https://apptoogoodtogo.com/api/auth/v1/token/refresh",
        {
          refresh_token: this.refreshToken,
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "user-agent":
              "TooGoodToGo/20.9.2 (837) (iPhone/iPhone XS (Global); iOS 14.0; Scale/3.00)",
            "accept-language": "en-GB",
            "accept-encoding": "gzip;q=1.0, compress;q=0.5 ",
            authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      this.setAccessToken(data.access_token);
      this.setRefreshToken(data.refresh_token);
    } catch (err) {
      console.log(err.message);
    }
  };

  sendWebhook = (status, store) => {
    const priceInCents = store.item.price.minor_units / 100;
    const priceInEur = priceInCents.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    });
    let color = "#000000";
    switch (status) {
      case "Added":
        color = "#0099ff";
        break;
      case "Restocked":
        color = "#00ff7a";
        break;
      default:
        color = "#000000";
        break;
    }

    const embed = new Discord.MessageEmbed()
      .addFields([
        { name: "Status", value: status, inline: true },
        { name: "Stock", value: store.items_available, inline: true },
        {
          name: "Price",
          value: priceInEur,
          inline: true,
        },
      ])
      .setTitle(store.display_name)
      .setColor(color)
      .setTimestamp()
      .setFooter(
        "Enrico",
        "https://avatars1.githubusercontent.com/u/34972497?s=460&u=8df9efb457444c65b809b63e0def4c768bbd63fa&v=4"
      );
    this.webhookClient.send({
      username: "Too Good To Go",
      avatarURL:
        "https://tgtg-mkt-cms-prod.s3.amazonaws.com/639/TGTG_Logo_2000x2000_RGB_Rastered-%282%29.png",
      embeds: [embed],
    });
  };

  compareStock = async (prev, curr) => {
    curr.forEach((current) => {
      const previous = prev.find(
        (prev_) => prev_.display_name == current.display_name
      );
      if (!previous) return this.sendWebhook("Added", current);
      const previousStock = previous.items_available;
      const currentStock = current.items_available;
      //console.log(current.display_name, previousStock, currentStock);
      if (currentStock > previousStock)
        return this.sendWebhook("Restocked", current);
    });
  };

  getFavorites = async () => {
    try {
      const { data } = await axios.post(
        "https://apptoogoodtogo.com/api/item/v6/",
        {
          favorites_only: true,
          origin: {
            latitude: 43.7002853569452,
            longitude: 7.272024885637856,
          },
          radius: 200,
          user_id: this.userId,
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "user-agent":
              "TooGoodToGo/20.9.2 (837) (iPhone/iPhone XS (Global); iOS 14.0; Scale/3.00)",
            "accept-language": "en-GB",
            "accept-encoding": "gzip;q=1.0, compress;q=0.5 ",
            authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      this.compareStock(this.favorites, data.items);
      this.setFavorites(data.items);
    } catch (err) {
      console.log(err.message);
    }
  };

  startMonitor = (interval) => {
    setInterval(this.getFavorites, interval);
  };
}

const main = async () => {
  const client = new TooGoodToGo({
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
    webhook: process.env.WEBHOOK,
  });

  await client.login();
  client.startMonitor(60 * 1000); // Once per minute
};

main();
