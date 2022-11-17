const axios = require("axios");
const ethers = require("ethers");

const covalentAPIKey = "ckey_50cc553087fe4cf59c1467041cc";
const chainId = 56;
const addrInvestor = "0x08D14Ca46D6B26cb23559646ecE3F94C903e5565";
const startBlk = 21300682;
const endBlk = 21464609;
const topics = ethers.utils.id("WithdrawBNB(address,address,uint256,uint256)");
const covalentAPIURL = `https://api.covalenthq.com/v1/${chainId}/events/topics/${topics}/?quote-currency=USD&format=JSON&starting-block=${startBlk}&ending-block=${endBlk}&sender-address=${addrInvestor}&page-size=10000&key=${covalentAPIKey}`;

function encode(types, values) {
    return ethers.utils.defaultAbiCoder.encode(types, values);
}

function decode(types, value) {
    return ethers.utils.defaultAbiCoder.decode(types, value);
}

const fetchEvent = async () => {
    let { data: res } = await axios.get(covalentAPIURL);

    if (res.data.items.length != 0) {
        res = res.data.items;
        console.log(
            res[res.length - 1],
            decode(
                ["address", "uint256", "uint256"],
                res[res.length - 1].raw_log_data
            )
        );
    }
};

fetchEvent();
