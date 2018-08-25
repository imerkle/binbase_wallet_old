import * as React from 'react';
import * as cx from 'classnames';

import Button from './Button';
import { CircularProgress } from '@material-ui/core';

class AButton extends React.Component<any, any>{
/*
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    className: PropTypes.string,
    loadingClass: PropTypes.string,
    fulFilledClass: PropTypes.string,
    rejectedClass: PropTypes.string,
    disabled: PropTypes.bool,
    text: PropTypes.node,
    pendingText: PropTypes.node,
    fulFilledText: PropTypes.node,
    rejectedText: PropTypes.node,
    onClick: PropTypes.func,
    loadingSize: PropTypes.number,
  };

  static defaultProps = {
    loadingClass: 'AButton--loading',
    fulFilledClass: 'AButton--fulfilled',
    rejectedClass: 'AButton--rejected',
    loadingSize: 14,
  };
*/

  state = {
    asyncState: null,
  };
  public isUnmounted;

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  resetState() {
    this.setState({
      asyncState: null,
    });
  }

  handleClick(...args) {
    const clickHandler = this.props.onClick;
    if (typeof clickHandler === 'function') {
      this.setState({
        asyncState: 'pending',
      });

      const returnFn = clickHandler.apply(null, args);
      if (returnFn && typeof returnFn.then === 'function') {
        returnFn
          .then(() => {
            if (this.isUnmounted) {
              return;
            }
            this.setState({
              asyncState: 'fulfilled',
            });
          })
          .catch(error => {
            if (this.isUnmounted) {
              return;
            }
            this.setState({
              asyncState: 'rejected',
            });
            throw error;
          });
      } else {
        this.resetState();
      }
    }
  }

  render() {
    const children: any = this.props.children;
    //some stupid ts error 
    
    const {
      text,
      pendingText,
      loadingSize,
      fulFilledText,
      rejectedText,
      className,
      loadingClass,
      fulFilledClass,
      rejectedClass,
      disabled,
      ...other
    } = this.props;

    const { asyncState } = this.state;
    const isPending = asyncState === 'pending';
    const isFulfilled = asyncState === 'fulfilled';
    const isRejected = asyncState === 'rejected';
    const isDisabled = disabled || isPending;
    let buttonText;

    if (isPending) {
      buttonText = pendingText || <CircularProgress color="secondary" size={loadingSize || 14} />;
    } else if (isFulfilled) {
      buttonText = fulFilledText;
    } else if (isRejected) {
      buttonText = rejectedText;
    }
    buttonText = buttonText || text;

    return (
      <Button
        {...other}
        className={cx(className, {
          [loadingClass]: isPending,
          [fulFilledClass]: isFulfilled,
          [rejectedClass]: isRejected,
        })}
        disabled={isDisabled}
        onClick={event => this.handleClick(event)}
      > 
        {/*@ts-ignore*/}
        {typeof children === 'function' ?  children({ buttonText, isPending, isFulfilled, isRejected, }) : buttonText || children}
      </Button>
    );
  }
}
export default AButton;
