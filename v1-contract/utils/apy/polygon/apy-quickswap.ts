import axios from "axios";
import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const GRAPH_V2_API_URL="https://api.fura.org/subgraphs/name/quickswap"
const APY_API_URL = "https://unpkg.com/quickswap-default-staking-list-address@latest/build/quickswap-default.lpfarms.json";
const PairFields = `
  fragment PairFields on Pair {
    id
    trackedReserveETH
    reserve0
    reserve1
    volumeUSD
    reserveUSD
    totalSupply
    token0 {
      symbol
      id
      decimals
      derivedETH
    }
    token1 {
      symbol
      id
      decimals
      derivedETH
    }
  }
`;

const clientV2 = new ApolloClient({
    link: new HttpLink({
      uri: GRAPH_V2_API_URL,
    }),
    cache: new InMemoryCache(),
    shouldBatch: true,
});

export const PAIRS_BULK: any = (pairs: any[]) => {
    let pairsString = `[`;
    pairs.map((pair) => {
      return (pairsString += `"${pair.toLowerCase()}"`);
    });
    pairsString += ']';
    const queryString = `
    ${PairFields}
    query pairs {
      pairs(first: ${pairs.length}, where: { id_in: ${pairsString} }, orderBy: trackedReserveETH, orderDirection: desc) {
        ...PairFields
      }
    }
    `;
    return gql(queryString);
  };

const getQuickswapAPY = async (lp: String) => {
    try {
        let { data: apyData } = await axios.get(APY_API_URL);
        if (!apyData) return { apy: 0 };

        apyData = apyData.active.filter(
            (it) =>
                it.pair &&
                String(it.pair).toLowerCase() ===
                    String(lp).toLowerCase()
        );

        if (apyData.length === 0) return { apy: 0 };

        const current = await clientV2.query({
            query: PAIRS_BULK([apyData.pair]),
            fetchPolicy: 'network-only',
        });

        return {
            apy: current.data,
        };
    } catch (err) {
        return { minAPY: 0, maxAPY: 0 };
    }
};

// getQuickswapAPY("0x19793B454D3AfC7b454F206Ffe95aDE26cA6912c");

export default getQuickswapAPY;
