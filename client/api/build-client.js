import axios from 'axios';

//Function that customizes the baseUrl and cookie for an axios request. When the request
//is from from the Next.js server, we must manually set the appropriate internal baseUrl
//and append a cookie through header.

export default ({ req }) => {
  //decide base-path base on existence of a window (a browser object). if it exists
  //the request is made from browser, else it's made from the Next.js server
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers
    });
  } else {
    return axios.create({
      baseURL: '/'
    });
  }
};
