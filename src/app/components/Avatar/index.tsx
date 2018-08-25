

import * as React from 'react';
import {stringToColour} from 'app/constants';
import {Avatar} from '@material-ui/core';
import Blockies from 'react-blockies';
import * as styles from './style.css';

const MyAvatar = (props) => {
  const {children, src, size, scale, ...others} = props;
  if(!src || src.indexOf(".jpg") > -1 || src.indexOf(".png") > -1 ){
	  return(
	    <Avatar src={src}
	       {...others}>
	    }
	    {children}
	    </Avatar>
	  );
	}else{
 	  const color = stringToColour(src+"color");
 	  const bgColor = stringToColour(src+"bgColor");
 	  const spotColor = stringToColour(src+"spotColor");
	  return(
        <div
			className={styles.blocky}
        >
		<Blockies
	        seed={src}
	        size={size || 10} 
	        scale={scale || 3} 
	        color={color}
	        bgColor={bgColor}
	        spotColor={spotColor}
	        {...others}
        />
        </div>
	  );
	}
}

export default MyAvatar;
