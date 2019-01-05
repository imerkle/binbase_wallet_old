import * as Sentry from "@sentry/browser";
import * as React from "react";
const pjson = require("../../../../package.json");

Sentry.init({
  dsn: "https://e8666e3fe9704004b98f9161a501b3ea@sentry.io/1357564",
  maxBreadcrumbs: 50,
  debug: true,
  release: `${pjson.name}@${pjson.version}`,
});

class SentryBoundary extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    public componentDidCatch(error, errorInfo) {
      console.log(error, errorInfo)
      Sentry.withScope((scope) => {
        Object.keys(errorInfo).forEach((key) => {
          scope.setExtra(key, errorInfo[key]);
        });
        Sentry.captureException(error);
      });
    }

    public render() {
        return (<div {...this.props}>{this.props.children}</div>);
    }
}

export default SentryBoundary;
