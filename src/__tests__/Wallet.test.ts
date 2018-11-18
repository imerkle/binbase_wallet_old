
const mnemonic = "connect ritual news sand rapid scale behind swamp damp brief explain ankle";
import OmniJs from '../app/omnijs/omnijs'

describe('Wallet Tests', function () {
    it('Bitcoin', function () {
        const omni = new OmniJs('BTC', 'BTC');
        const k = omni.generateSeed(mnemonic);
        expect(k.address).toEqual(`1JN2GamM8pXmJvSRKxiRBppf9Zgur6Ze7L`);
    })
});