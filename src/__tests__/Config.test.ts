import {config} from '../app/constants'

const coins = [];
for (let x in config) {
    coins.push(config[x]);
}
describe('Check Coin Config', function () {
    it('Must have Properties', function () {
        coins.map(o=>{
            expect(o).toHaveProperty('explorer')
            expect(o).toHaveProperty('api')
            expect(o).toHaveProperty('decimals')
            expect(o).toHaveProperty('fee_label')
            expect(o).toHaveProperty('name')
            expect(o).toHaveProperty('code')
            expect(o).toHaveProperty('forks')
        })
    });
    it('Check Assets', function () {
        coins.map(o => {
            if(o.assets){
                for (let oxc in o.assets){
                    const ox = o.assets[oxc];
                    expect(ox).toHaveProperty('hash')
                    expect(ox).toHaveProperty('ticker')
                    expect(ox).toHaveProperty('name')                    
                    expect(ox).toHaveProperty('decimals')                    
                }
            }
        });
    })
});
