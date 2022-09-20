const axios = require("axios");
const ethers = require("ethers");

const covalentAPIKey = "ckey_50cc553087fe4cf59c1467041cc";
const chainId = 56;
const addrInvestor = "0x08D14Ca46D6B26cb23559646ecE3F94C903e5565";
const startBlk = 21300682;
const endBlk = 21464609;
const covalentAPIURL = `https://api.covalenthq.com/v1/${chainId}/events/address/${addrInvestor}/?quote-currency=USD&format=JSON&starting-block=${startBlk}&ending-block=${endBlk}&page-number=&page-size=100000&key=${covalentAPIKey}`;

const fetchEvent = async () => {
  let { data: res } = await axios.get(covalentAPIURL);

  if (res.data.items.length != 0) {
    res = res.data.items;
    console.log(res[res.length - 1]);
  }
};

fetchEvent();
