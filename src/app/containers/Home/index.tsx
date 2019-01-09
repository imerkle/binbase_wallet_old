import * as React from "react";
import Slider from "react-slick";
import cx from 'classnames';
import * as styles from './style.css';
import * as stylesg from '../../style.css';
import {Typography} from '@material-ui/core';
import {changelog} from 'app/constants';

class Home extends React.Component<any, any> {
    public render() {
        const settings = {
          dots: true,
          infinite: true,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        };
        return (
          <>
            <Slider {...settings}>
              <SliderImage url="https://occ-0-2704-2186.1.nflxso.net/art/f90c7/057fa9bd0fc04ccea809baaffca34fb3457f90c7.jpg" title="Hero Loreum of Ipsom"/>
              <SliderImage url="https://assets.kucoin.com/web/pc/static/box3_en.93f2f3a1.png"/>
            </Slider>

            <div className={cx(stylesg.mar_20)}>
              <Typography className={cx(stylesg.h4)} variant="h4">Changelog</Typography>
              {changelog.map((o, i)=>{
                return (
                    <div key={i}>
                      <Typography className={cx(stylesg.h5)} variant="h5">{o.title}</Typography>
                      <ul>
                        {o.captions.map((ox, ix)=>{
                          return (
                              <li key={ix}><Typography className={cx(stylesg.caption)} variant="caption">{ox}</Typography></li>
                            )
                        })}
                      </ul>                      
                    </div>
                  )
                
              })}
            </div>
          </>
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
