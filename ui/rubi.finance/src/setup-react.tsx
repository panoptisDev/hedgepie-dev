import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { default as LazyPages } from 'Pages/routes';
import {
  BrowserRouter,
  Switch,
  Route,
} from 'react-router-dom';
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import { Spinner, ThemeProvider } from 'theme-ui';
import theme from 'Common/theme';
import {
  LocalStorageWrapper,
  persistCache
} from 'apollo3-cache-persist';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { onError } from '@apollo/client/link/error';
import { OperationDefinitionNode } from 'graphql';
import useMouseflow from 'Common/hooks/useMouseflow';

const {
  BUGSNAG_API_KEY,
  APP_VERSION,
  BUGSNAG_RELEASE_STAGE
} = env;

const App: React.FC = () => {
  const [pages] = useState(LazyPages.map(lazyPage => ({
    component: React.lazy(
      () =>
        import(
          /* webpackChunkName: "[request]" */`./page/${lazyPage.entry}`
        )
    ),
    ...lazyPage
  })));
  const [apolloClient, setApolloClient] = useState<
    ApolloClient<Record<string, unknown>> | undefined
  >();
  const mf = useMouseflow();

  const setupApp = async (): Promise<{
    client: ApolloClient<Record<string, unknown>>;
  }> => {
    // Try-catch because `Bugsnag.start` will throw if called with invalid
    // `apiKey`
    try {
      Bugsnag.start({
        apiKey: BUGSNAG_API_KEY,
        plugins: [new BugsnagPluginReact],
        appVersion: APP_VERSION,
        enabledReleaseStages: ['production', 'staging'],
        releaseStage: BUGSNAG_RELEASE_STAGE,
      });
      mf.push(m =>
        Bugsnag.addMetadata('mouseflow', {
          sessionId: m.getSessionId(),
        })
      );
    } catch (error) {
      console.error(error);
    }

    const retryLink = new RetryLink;

    const httpLink = new HttpLink({
      uri: env.GATEWAY_API_URL,
      credentials: 'include',
    });

    const createErrorLink = (): ApolloLink => {
      return onError((err) => {
        const { graphQLErrors, operation } = err;
        Bugsnag.addMetadata('GraphQL', { operation });
        if (graphQLErrors) {
          let unauthError = false;
          graphQLErrors.forEach(err => {
            const { message: errMsg, path } = err;
            switch (err.extensions?.code) {
              default: {
                Bugsnag.notify(
                  `[GraphQL error]: Message: ${errMsg}, error: \
                  ${JSON.stringify(err)}, Path: ${path}`
                );
                const hasMutation = operation.query.definitions.some(
                  d => (d as OperationDefinitionNode).operation === 'mutation'
                );
                if (hasMutation) {
                  const lastSawErr = localStorage.getItem('lastSawError');
                  // prevent error message spam when multiple queries fail
                  if (!lastSawErr || parseInt(lastSawErr) + 10000 < Date.now()) {
                    localStorage.setItem('lastSawError', Date.now().toString());
                    alert(
                      `An error occured and our team has been notified. 
                    Please contact support@rubi.finance if you require assistance.`
                    );
                  }
                }
                break;
              }
            }
          });
        }
      });
    };

    const link = createErrorLink()
      .concat(retryLink.split(
        op => op.getContext().uri === env.GATEWAY_API_URL,
        httpLink,
      ));

    const cache = new InMemoryCache();
    await persistCache({
      cache,
      storage: new LocalStorageWrapper(window.localStorage),
    });

    const client = new ApolloClient({
      cache,
      link
    });

    return {
      client,
    };
  };

  useEffect(() => {
    setupApp().then(({ client }) => {
      setApolloClient(client);
    });
  }, []);

  return apolloClient ? (
    <ThemeProvider theme={theme}>
      <ApolloProvider client={apolloClient}>
        <React.Suspense fallback={<Spinner />}>
          <Switch>
            {pages.map((page, i) => (
              <Route
                exact={typeof page.exact !== 'undefined' ? page.exact : true}
                path={page.route as string}
                component={page.component}
                key={i}
              />
            ))}
          </Switch>
        </React.Suspense>
      </ApolloProvider>
    </ThemeProvider>
  ) : (
    <Spinner />
  );
};

export default (): void => {
  ReactDOM.render((
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ), document.querySelector('#react-app'));
};
