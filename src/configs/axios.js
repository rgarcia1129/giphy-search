import axios from 'axios';
import {getToken} from 'utils/utils';
const host = process.env.REACT_APP_AXIOS_BASE_URL;


axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.timeout = 10000;

export default axios;

export const postRequest = (endpoint, data) => {
  const Authorization = getToken();

  return axios.post(`${host}${endpoint}`, data, {headers: { Authorization }})
  .then((response) => response.data )
  .catch(error => {
    console.log(error);
  })
}

export const getRequest = (endpoint, params) => {
  const Authorization = getToken();

  const config = {
    headers: {Authorization},
    params
  }

  return axios.get(`${host}${endpoint}`,config)
  .then((response) => response.data )
  .catch(error => {
    console.log(error);
  })
}
