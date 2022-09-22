import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

//This is Next.js's Global react wrapper component for importing libraries and building
//default components that will be displayed in all pages

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

//GetInitialProp() is Next.js's pre-html-component rendering call. This is how we can
//make request to retrieve data for display before rendering the page. This function doesn't
//know about the hooks/use-request helper function when it's called so we've to use axios
AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  //explicitly invoke getInitialProp() of each child page because they don't get invoked
  //automatically once we've called the getInitialProp for AppComponent
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return {
    pageProps,
    currentUser: data.currentUser
  };
};

export default AppComponent;
