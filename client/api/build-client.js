import axios from 'axios';

//Function that customizes the baseUrl and cookie for an axios request. When the request
//is from from the Next.js server, we must manually set the appropriate internal baseUrl
//and append a cookie through header.

export default ({ req }) => {
  //decide base-path base on existence of a window (a browser object).
  if (typeof window === 'undefined') {
    //request is made from server. Once user has bought a domain name,
    //need to change this server base url to the domain name instead
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers
    });
  } else {
    //request is made from browser
    return axios.create({
      baseURL: '/'
    });
  }
};
