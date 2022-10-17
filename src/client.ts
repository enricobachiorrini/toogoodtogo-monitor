import got, { Got } from "got";
import { Response as AuthByEmailResponse } from "./types/AuthByEmailResponse";
import {
  Response as AuthByRequestPollingId,
  User,
} from "./types/AuthByRequestPollingId";
import { Response as BucketResponse } from "./types/Bucket";
import { Response as RefreshResponse } from "./types/Refresh";
import { logger } from "./utils/logger";
import { sleep } from "./utils/sleep";
import moment, { Moment } from "moment";
import { HttpsProxyAgent } from "hpagent";

export class TGTGClient {
  pollingDelay = 5000;
  proxy?: string;
  client: Got;
  user?: User;
  accessToken?: string;
  accessTokenTTL?: number;
  refreshToken?: string;
  lastLogin?: Moment;

  constructor({ proxy }: { proxy?: string }) {
    this.proxy = proxy;
    this.client = got.extend({
      prefixUrl: "https://apptoogoodtogo.com/api/",
      headers: {
        "User-Agent":
          "TooGoodToGo/22.10.0 (4665) (iPhone/iPhone XS Max; iOS 16.0.2; Scale/3.00/iOS)",
        "Accept-Language": "en-GB",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
      },
      agent: proxy
        ? {
            https: new HttpsProxyAgent({
              keepAlive: true,
              keepAliveMsecs: 1000,
              maxSockets: 256,
              maxFreeSockets: 256,
              scheduling: "lifo",
              proxy: proxy,
            }),
          }
        : undefined,
      hooks: {
        beforeRequest: [
          async (options) => {
            if (
              this.lastLogin &&
              options.url.pathname != "/api/auth/v3/token/refresh"
            ) {
              // https://momentjs.com/docs/#/manipulating/
              // Moments are mutable. Perform a copy to leave intact the original lastLogin.
              const lastLogin = moment(this.lastLogin);
              const expiry = lastLogin.add(this.accessTokenTTL, "s");

              if (moment().isAfter(expiry)) {
                await this.refresh();
              }
            }

            if (this.accessToken) {
              options.headers.Authorization = `Bearer ${this.accessToken}`;
            }
          },
        ],
      },
    });
  }

  async login(email: string) {
    logger.info(`Logging in with email ${email}.`);

    const response = await this.client.post("auth/v3/authByEmail", {
      responseType: "json",
      json: {
        email: email,
        device_type: "IOS",
      },
    });
    const data = response.body as AuthByEmailResponse;

    while (true) {
      await this.polling(email, data.polling_id);
      if (this.accessToken) break;
      logger.info(`Sleeping ${this.pollingDelay} ms.`);
      await sleep(this.pollingDelay);
    }

    logger.info(`Successfully logged in.`);
  }

  async polling(email: string, pollingId: string) {
    logger.info(`Polling ${pollingId}.`);
    const response = await this.client.post("auth/v3/authByRequestPollingId", {
      responseType: "json",
      json: {
        email: email,
        device_type: "IOS",
        request_polling_id: pollingId,
      },
    });
    if (response.statusCode == 202) {
      logger.info(`The link wasn't opened. Please check your email.`);
    } else if (response.statusCode == 200) {
      const data = response.body as AuthByRequestPollingId;
      this.accessToken = data.access_token;
      this.accessTokenTTL = data.access_token_ttl_seconds;
      this.refreshToken = data.refresh_token;
      this.lastLogin = moment();
      this.user = data.startup_data.user;
    }
  }

  async refresh() {
    logger.info(`Refreshing token.`);
    const response = await this.client.post("auth/v3/token/refresh", {
      responseType: "json",
      json: {
        refresh_token: this.refreshToken,
      },
    });

    const data = response.body as RefreshResponse;
    this.accessToken = data.access_token;
    this.accessTokenTTL = data.access_token_ttl_seconds;
    this.refreshToken = data.refresh_token;
    this.lastLogin = moment();
  }

  async getFavorites() {
    if (!this.user) throw new Error(`Please log in first.`);

    const response = await this.client.post("discover/v1/bucket", {
      responseType: "json",
      json: {
        paging: {
          size: 50,
          page: 0,
        },
        user_id: this.user.user_id,
        bucket: {
          filler_type: "Favorites",
        },
        origin: {
          longitude: 0,
          latitude: 0,
        },
        radius: 90,
      },
    });

    const data = response.body as BucketResponse;
    return data.mobile_bucket.items;
  }
}
