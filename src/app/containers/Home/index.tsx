import * as React from "react";
import Slider from "react-slick";
import cx from 'classnames';
import * as styles from './style.css';

class Home extends React.Component<any, any> {
    public render() {
        const settings = {
          dots: true,
          infinite: true,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1
        };
        return (
          <Slider {...settings}>
            <SliderImage url="https://occ-0-2704-2186.1.nflxso.net/art/f90c7/057fa9bd0fc04ccea809baaffca34fb3457f90c7.jpg" title="Hero Loreum of Ipsom"/>
            <SliderImage url="https://assets.kucoin.com/web/pc/static/box3_en.93f2f3a1.png"/>
          </Slider>
        );
    }
}
const SliderImage  = (props) => {
  const {url, title} = props;
  return (
    <div className={cx(styles.cover)} style={{backgroundImage: `url(${url})`}}>  
      <div className={cx(styles.bottomTitle)}>{title}</div>
      <div className={cx(styles.bottomShadow)}></div>
    </div>
  )
}
export default Home;
