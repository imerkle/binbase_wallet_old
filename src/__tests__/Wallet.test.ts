
const mnemonic = "connect ritual news sand rapid scale behind swamp damp brief explain ankle";
import OmniJs from '../app/omnijs'

describe('Wallet Address Generation', function () {
    it('Bitcoin', function () {
        const omni = new OmniJs('BTC', 'BTC');
        const k = omni.generateSeed(mnemonic);
        expect(k.address).toEqual(`1JN2GamM8pXmJvSRKxiRBppf9Zgur6Ze7L`);
    })
    it('Litecoin', function () {
        const omni = new OmniJs('LTC', 'BTC');
        const k = omni.generateSeed(mnemonic);
        expect(k.address).toEqual(`LfPqHoYgghwxjJt2BrjrqwPjhRwk69VFZx`);
    })
    it('Dash', function () {
        const omni = new OmniJs('DASH', 'BTC');
        const k = omni.generateSeed(mnemonic);
        expect(k.address).toEqual(`XyQ5Dc9abDeRpiihst9JY1M5fhTv4nKJL5`);
    })
    it('Ethereum', function () {
        const omni = new OmniJs('ETH', 'ETH');
        const k = omni.generateSeed(mnemonic);
        expect(k.address).toEqual(`0xb023b80afad0363ab966cf10b5f76E5f625Cf497`);
    })
    it('Vechain', function () {
        const omni = new OmniJs('VET', 'VET');
        const k = omni.generateSeed(mnemonic);
        expect(k.address).toEqual(`0x684e90C1e5aB7449988D3180C34A99f92A54b705`);
    })
    it('Ripple', function () {
        const omni = new OmniJs('XRP', 'XRP');
        const k = omni.generateSeed(mnemonic);
        expect(k.address).toEqual(`rPphbLGemSQv4De1LUHYq6tupBkrrZUxNe`);
    })
    it('Neo', function () {
        const omni = new OmniJs('NEO', 'NEO');
        const k = omni.generateSeed(mnemonic);
        expect(k.address).toEqual(`AShDKgLSuCjGZr8Fs5SRLSYvmcSV7S4zwX`);
    })
});