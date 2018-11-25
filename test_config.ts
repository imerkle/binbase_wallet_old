const a = {
    "BTC": {
        "explorer": "https://test-insight.bitpay.com",
        "api": "https://test-insight.bitpay.com/api",
        "code": 1,
        "decimals": 10 ** 8,
        "forks": ["LTC", "DASH"],
        "fee_label": "Sats",
        //"estimateFee": true,
        "base": true,
        "name": "Bitcoin",
        "network": {
            name: 'Bitcoin',
            per1: 1e8,
            unit: 'BTC',
            messagePrefix: '\x18Bitcoin Signed Message:\n',
            hashGenesisBlock: '000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943',
            port: 18333,
            portRpc: 18332,
            protocol: {
                magic: 0x0709110b
            },
            seedsDns: [
                'testnet-seed.alexykot.me',
                'testnet-seed.bitcoin.schildbach.de',
                'testnet-seed.bitcoin.petertodd.org',
                'testnet-seed.bluematt.me'
            ],
            versions: {
                bip32: {
                    private: 0x04358394,
                    public: 0x043587cf
                },
                bip44: 1,
                private: 0xef,
                public: 0x6f,
                scripthash: 0xc4
            }
        },
    },
    "LTC": {
        "explorer": "https://testnet.litecore.io",
        "api": "https://testnet.litecore.io/api",
        "code": 1,
        "decimals": 10 ** 8,
        "fee_label": "LTC",
        "name": "Litecoin",
        "ofBase": "BTC",
        "forks": [],
        "network": {
            name: 'Litecoin',
            unit: 'LTC',            
            hashGenesisBlock: 'f5ae71e26c74beacc88382716aced69cddf3dffff24f384e1808905e0188f68f',
            versions: {
                bip32: {
                    private: 0x0436ef7d,
                    public: 0x0436f6e1
                },
                bip44: 1,
                private: 0xef,
                public: 0x6f,
                scripthash: 0x3a,
                scripthash2: 0xc4
            }
        }
    },
    "DASH": {
        "explorer": "https://testnet-insight.dashevo.org/insight",
        "api":"https://testnet-insight.dashevo.org/insight-api-dash",
        "code": 5,
        "decimals": 10 ** 8,
        "fee_label": "DASH",
        "name": "Dash",
        "ofBase": "BTC",
        "forks": [],
        "network": {
            name: 'Dash',
            unit: 'DASH',       
            hashGenesisBlock: '00000bafbc94add76cb75e2ec92894837288a481e5c005f6563d91623bf8bc2c',
            port: 19999,
            portRpc: 19998,
            seedsDns: [
                'dashdot.io',
                'testnet-seed.dashdot.io',
                'masternode.io',
                'test.dnsseed.masternode.io'
            ],
            versions: {
                bip32: {
                    private: 0x04358394,
                    public: 0x043587cf
                },
                bip44: 1,
                private: 0xef,
                public: 0x8c,
                scripthash: 0x13
            },                 
        },
    },
    "ETH": {
        "explorer":"https://rinkeby.etherscan.io",
        "api": "https://api-rinkeby.etherscan.io/api",
        "api_tokens": "https://tokenbalancerinkeby.herokuapp.com/api/balance",
        "rpc": "https://rinkeby.infura.io/v3/2294f3b338ad4524aa9186012810e412",
        "assets": {
            "TRST": {
                "hash": "0x87099add3bcc0821b5b151307c147215f839a110",
                "ticker": "TRST",
                "name": "WeTrust",
                "decimals": 6
            }            
        },
        "code": 1,
        "decimals": 10 ** 18,
        "fee_label": "gwei",
        //"estimateFee": true,
        "dualFee": true,
        "base": true,
        "name": "Ethereum",
        "forks": [],
    },
    "NEO": {
        "explorer": "http://35.243.206.176:4000/",
        "api": "http://35.243.206.176:4000/api/main_net/v1",
        "code": 1,
        "assets": require("./neo_assets.json"),
        "decimals": 10 ** 0,
        "fee_label": "GAS",
        "base": true,
        "name": "Neo",
        "forks": [],
    },
    "NANO": {
        "explorer": "https://www.nanode.co",
        "api":  "http://35.227.18.245:7076/",
        "code": 1,
        "decimals": 10 ** 18,
        "fee_label": "",
        "noFee": true,
        "base": true,
        "name": "Nano",
        "forks": [],
        "rep": "xrb_17krztbeyz1ubtkgqp9h1bewu1tz8sgnpoiii8q7c9n7gyf9jfmuxcydgufi",
    },
    "VET": {
        "explorer": "https://testnet.veforge.com",
        "api": "https://testnet.veforge.com/api",
        "rpc": "https://0e4039cc.ngrok.io",
        "assets": require("./vet_assets.json"),
        "code": 1,
        "decimals": 10 ** 18,
        "fee_label": "VTHO",
        "dualFee": true,
        "base": true,
        "name": "Vechain",
        "forks": [],
    },
    "XRP": {
        "explorer": "https://xrpcharts.ripple.com/#/transactions",
        "api": "https://xrpnode.herokuapp.com/api",
        "rpc": "https://s.altnet.rippletest.net:51234",
        "code": 1,
        "decimals": 10 ** 6,
        "fee_label": "XRP",
        "base": true,
        "name": "Ripple",
        "forks": [],
        "node": "test",
        "noFee": true,
    },    
    /*
    "XMR": {
        "explorer": {
            "main": "https://www.nanode.co/",
            "test": "https://www.nanode.co/"
        },estimateFee
        "api": {
            "main": "http://35.227.18.245:7076/",
            "test": "http://35.227.18.245:7076/"
        },
        "code": 128,
        "decimals": 10 ** 18,
    },    */
}

export default a;