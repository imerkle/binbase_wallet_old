// @flow
import { inject, observer } from "mobx-react";
import * as React from "react";

@inject("rootStore")
@observer
class CoinFake extends React.Component<any, any> {
    public componentDidMount() {
        this.init();
    }
    public componentWillReceiveProps() {
       this.init();
    }
    public init = () => {
        const { exchangeStore } = this.props.rootStore;
        const { base } = this.props.match.params;

        exchangeStore.setBase(base);
        exchangeStore.setRel(null);
    }
    public render() {
        return (null);
    }
}
export default CoinFake;
