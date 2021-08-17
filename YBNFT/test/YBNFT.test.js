const YBNFT = artifacts.require("YBNFT");
const RNG = artifacts.require("RNG");
const { assert, expect } = require("chai");
const BN = require('bn.js');
require("chai")
    .use(require("chai-as-promised"))
    .should();

let rng, ybnft;
contract("YBNFT", async ([dev, user1, user2, lottery, treasury])=>{

    before(async()=>{
        rng = await RNG.new();
        ybnft = await YBNFT.new(treasury, lottery, rng.address, {from: dev});
    });

    it("RNG seeds", async()=>{
        await rng.seed(user1);
        assert(true);
    });

    it("getRNG", async()=>{
        const rand = await rng.getRNG(user1);
        assert(true);
    });

    it("YBNFT submits", async()=>{
        await ybnft.submitNFT(user2,{from:lottery});
        assert(true);
    });

    it("YBNFT claim", async()=>{
        const balBefore = await ybnft.balanceOf(user2);
        await ybnft.claimNFT({from:user2});
        const balAfter = await ybnft.balanceOf(user2);

        assert.equal((balBefore.add(new BN('1'))).toString(), balAfter.toString());
    })
});