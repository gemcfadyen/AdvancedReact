import React from "react";
import App, {Container} from "next/app"
import Page from "../components/Page"

import {ApolloProvider} from "react-apollo";
import withData from "../lib/withData";

class MyApp extends App {
  //next.js lifecycle method which will run first
  static async getInitialProps({Component, ctx}) {
    let pageProps = {};
    if (Component.getIntitialProps) {
      //will crawl each component/page for query/mutations that need to be fetched
      pageProps = await Component.getInitialProps(ctx);
    }
    //this exposes the query to the user
    pageProps.query = ctx.query;

    return {pageProps};
  }

  render() {
    const {Component, apollo, pageProps} = this.props;

    return (<Container>
      <ApolloProvider client={apollo}>
        <Page>
          <Component {...pageProps} />
        </Page>
      </ApolloProvider>
    </Container>);
  }
}

export default withData(MyApp);