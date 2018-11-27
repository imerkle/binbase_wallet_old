// @flow
import * as React from 'react';
import { observer, inject } from 'mobx-react';

@inject('rootStore')
@observer
class CoinFake extends React.Component<any, any>{
    componentDidMount() {
        this.init()
    }
    componentWillReceiveProps(){
       this.init()
    }    
    init = () => {
        const { exchangeStore } = this.props.rootStore;
        const { base } = this.props.match.params;

        exchangeStore.setBase(base);
        exchangeStore.setRel(null);
    }
    render() {
        return (null);
    }
}
export default CoinFake;
