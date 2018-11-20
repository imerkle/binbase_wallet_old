import {config} from '../app/constants'

const coins = [];
for (let x in config) {
    coins.push(config[x]);
}
describe('Check Coin Config', function () {
    it('Has Codes', function () {
        coins.map(o=>{
            expect(o).toHaveProperty('explorer')
            expect(o).toHaveProperty('api')
            expect(o).toHaveProperty('decimals')
            expect(o).toHaveProperty('fee_label')
            expect(o).toHaveProperty('name')
            expect(o).toHaveProperty('code')
        })
    });
});
