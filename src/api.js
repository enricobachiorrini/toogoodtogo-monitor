const axios = require("axios");

axios.defaults.baseURL = "https://apptoogoodtogo.com/api";
axios.defaults.headers.common = {
  accept: "application/json",
  "content-type": "application/json",
  "user-agent":
    "TooGoodToGo/20.9.2 (837) (iPhone/iPhone XS (Global); iOS 14.0; Scale/3.00)",
  "accept-language": "en-GB",
  "accept-encoding": "gzip;q=1.0, compress;q=0.5 ",
};

exports.loginByEmail = async (email, password) => {
  return axios.post("/auth/v1/loginByEmail", {
    device_type: "IOS",
    email: email,
    password: password,
  });
};

exports.refreshAccessToken = (accessToken, refreshToken) => {
  return axios.post(
    "/auth/v1/token/refresh",
    {
      refresh_token: refreshToken,
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

exports.getFavorites = (accessToken, userId) => {
  return axios.post(
    "/item/v6/",
    {
      favorites_only: true,
      origin: {
        latitude: 43.7002853569452,
        longitude: 7.272024885637856,
      },
      radius: 200,
      user_id: userId,
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );
};
