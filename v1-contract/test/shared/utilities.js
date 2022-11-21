async function forkETHNetwork() {
    await hre.network.provider.request({
        method: "hardhat_reset",
        params: [
            {
                forking: {
                    jsonRpcUrl: "https://rpc.ankr.com/eth",
                },
            },
        ],
    });
};

async function setPath(adapter, first, second, third = null) {
    if(third) {
        await adapter.setPath(first, second, [first, third, second]);
        await adapter.setPath(second, first, [second, third, first]);
    } else {
        await adapter.setPath(first, second, [first, second]);
        await adapter.setPath(second, first, [second, first]);
    }
    
}

module.exports = {
    setPath,
    forkETHNetwork
}
