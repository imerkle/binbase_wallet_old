// @flow
import * as React from 'react';
import { observer, inject } from 'mobx-react';

import { Icon } from '@material-ui/core';
import { FaDiv, Div, Button } from 'app/components';
import { StyleRules, Theme, withStyles } from '@material-ui/core/styles';
import * as cx from 'classnames';
import { compose } from "recompose";

const styleSheet = (theme: Theme): StyleRules => ({
  icon: {
    fontSize: '65px',
    color: '#98a9b4'
  },
  overlay: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
		zIndex: 150,
		transform: 'scale(0)',
		animation: '.15s transform',
  },
  root: {
    background: '#FFF',
    textAlign: 'center',
    padding: '60px 25px 25px 25px',
    borderRadius: '6px',
    position: 'relative',
    width: '369px',
  },
  '@keyframes growDarkOverlay': {
    from: {
      transform: 'scale(0)',
    },
    to: {
      transform: 'scale(1)',
      background: 'rgba(0,0,0,.3)',
    },
  },  
  iconRoot:{
    position: 'absolute',
    top: '-30px',
    background: '#fff',
    padding: '10px',
    left: '50%',
    transform: 'translate(-50%, 0%)',
    borderRadius: '50%',
  },
  title: {
    fontWeight: 700,
    fontSize: '24px',
    color: '#535559',
  },
  description: {
    marginTop: '14px',
    marginBottom: 0,
    fontWeight: 300,
    lineHeight: '28px',
    fontSize: '18px',
    color: '#96a6b1',
    wordWrap: 'break-word',
  },
  controls: {
    marginTop: '28px',
  },  
});

interface ErrorProps{
  errorStore?: any,
  langStore?: any,
  overlayClassName: string,
  classes?: any,
}

@compose(
    withStyles(styleSheet),
)
@inject('errorStore','langStore') 
@observer
class Error extends React.Component<ErrorProps, any>{

  public static defaultProps: Partial<ErrorProps> = {
    overlayClassName: ""
  }

  handleContainerClick(e){
    e.stopPropagation();
  }
  parseErrorCode(){
    const {errorStore , langStore } = this.props;
    if(errorStore.errorCode > -1 && errorStore.errorActive){
      errorStore.setErrorParams(langStore.getE(errorStore.errorCode));
    }
  }
  render() {
    const { errorStore, classes, overlayClassName } = this.props;

     if(!errorStore.errorActive){
       return (null)
     }
      return (
          <FaDiv hcenter vcenter className={cx(classes.overlay, overlayClassName)} onClick={()=>{errorStore.deactivateError()}} >
            <Div className={cx(classes.root)} onClick={this.handleContainerClick}>
              {errorStore.errorIcon && 
               <Div className={classes.iconRoot}>
                <Icon className={classes.icon} >{errorStore.errorIcon}</Icon>
                </Div>
              }
              <Div className={cx(classes.content)}>
                  <Div className={cx(classes.title)}>
                    {errorStore.errorTitle}
                  </Div>
                  <Div className={cx(classes.description)}>
                    {errorStore.errorDescription}
                  </Div>
              </Div>
              <Div className={cx(classes.controls)}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth={true}
                  onClick={errorStore.deactivateError}>
                    {errorStore.errorLabel}
                </Button>
              </Div>
            </Div>
          </FaDiv>
      );
  }
}
/*
backgroundColor={materialStyle.cancelGrayButtonBackground} style={materialStyle.cancelGrayButton}
labelColor={materialStyle.cancelGrayButtonLabel}
*/
export default Error;
