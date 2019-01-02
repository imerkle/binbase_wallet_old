import cx from "classnames";
import * as React from "react";

import { CircularProgress } from "@material-ui/core";
import Button from "./Button";

class AButton extends React.Component<any, any> {
  public state = {
    asyncState: null,
  };
  public isUnmounted;

  public componentWillUnmount() {
    this.isUnmounted = true;
  }

  public resetState() {
    this.setState({
      asyncState: null,
    });
  }

  public handleClick(...args) {
    const clickHandler = this.props.onClick;
    if (typeof clickHandler === "function") {
      this.setState({
        asyncState: "pending",
      });

      const returnFn = clickHandler.apply(null, args);
      if (returnFn && typeof returnFn.then === "function") {
        returnFn
          .then(() => {
            if (this.isUnmounted) {
              return;
            }
            this.setState({
              asyncState: "fulfilled",
            });
          })
          .catch((error) => {
            if (this.isUnmounted) {
              return;
            }
            this.setState({
              asyncState: "rejected",
            });
            throw error;
          });
      } else {
        this.resetState();
      }
    }
  }

  public render() {
    const children: any = this.props.children;
    // some stupid ts error

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
    const isPending = asyncState === "pending";
    const isFulfilled = asyncState === "fulfilled";
    const isRejected = asyncState === "rejected";
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
        onClick={(event) => this.handleClick(event)}
      >
        {/*@ts-ignore*/}
        {typeof children === "function" ?  children({ buttonText, isPending, isFulfilled, isRejected }) : buttonText || children}
      </Button>
    );
  }
}
export default AButton;
