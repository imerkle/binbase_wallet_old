
const mnemonic = "connect ritual news sand rapid scale behind swamp damp brief explain ankle";
import * as omnijs from '../app/omnijs'

const wallets = [
{
    name: "Bitcoin",
    rel: "BTC",
    base: "BTC",
    address: "1JN2GamM8pXmJvSRKxiRBppf9Zgur6Ze7L",
},
{
    name: "Litecoin",
    rel: "LTC",
    base: "BTC",
    address: "LfPqHoYgghwxjJt2BrjrqwPjhRwk69VFZx",
},
{
    name: "Dash",
    rel: "DASH",
    base: "BTC",
    address: "XyQ5Dc9abDeRpiihst9JY1M5fhTv4nKJL5",
},
{
    name: "Ethereum",
    rel: "ETH",
    base: "ETH",
    address: "0xb023b80afad0363ab966cf10b5f76E5f625Cf497",
},
{
    name: "Vechain",
    rel: "VET",
    base: "VET",
    address: "0x684e90C1e5aB7449988D3180C34A99f92A54b705",
},
{
    name: "Ripple",
    rel: "XRP",
    base: "XRP",
    address: "rPphbLGemSQv4De1LUHYq6tupBkrrZUxNe",
},
{
    name: "Neo",
    rel: "NEO",
    base: "NEO",
    address: "AShDKgLSuCjGZr8Fs5SRLSYvmcSV7S4zwX",
}];
const config = require('app/constants/config').default
describe('Wallet Address Generation', () => {
    const options = {config};
    wallets.map(o=>{
        it(o.name, () => {
            const k = omnijs.generateSeed(mnemonic, '', {config, rel: o.rel, base: o.base});
            expect(k.address).toEqual(o.address);
        });
    })
});