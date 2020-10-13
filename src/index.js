const Discord = require("discord.js");
const redis = require("async-redis");
require("dotenv").config();

const api = require("./api.js");

const client = redis.createClient({ url: process.env.REDIS_URL });

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

  login = async () => {
    this.refreshToken
      ? await this.refreshAccessToken()
      : await this.loginByEmail();
  };

  loginByEmail = async () => {
    try {
      const { data } = await api.loginByEmail(this.email, this.password);
      this.setAccessToken(data.access_token);
      this.setUserId(data.startup_data.user.user_id);
      this.setRefreshToken(data.refresh_token);
    } catch (err) {
      console.log(err);
    }
  };

  refreshAccessToken = async () => {
    try {
      const { data } = await api.refreshAccessToken(
        this.accessToken,
        this.refreshToken
      );
      this.setAccessToken(data.access_token);
      this.setRefreshToken(data.refresh_token);
    } catch (err) {
      console.log(err);
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
      case "OOS":
        color = "#ff005c";
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

  compareStock = async (restaurant) => {
    const stock = await client.get(restaurant.item.item_id);
    if (!stock) return this.sendWebhook("Added", restaurant);
    if (restaurant.items_available > stock)
      return this.sendWebhook("Restocked", restaurant);
    if (stock > 0 && restaurant.items_available == 0)
      return this.sendWebhook("OOS", restaurant);
  };

  getFavorites = async () => {
    try {
      const { data } = await api.getFavorites(this.accessToken, this.userId);
      data.items.forEach(async (restaurant) => {
        await this.compareStock(restaurant);
        await client.set(restaurant.item.item_id, restaurant.items_available);
      });
    } catch (err) {
      console.log(err);
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
  client.startMonitor(1000 * 60); // Once per minute
};

main();
