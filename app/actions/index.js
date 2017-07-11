import axios from 'axios';

export const GET_SCU_DATA = "GET_SCU_DATA";
const ROOT_URL = 'https://www.scu.edu/apps/ws/courseavail/search/';
const FALL2017 = 3900;

export function getSearchData(values, callback) {
  const request = axios.post(`${ROOT_URL}/${FALL2017}/all`, values)
    .then(() => callback());

  return {
    type: GET_SCU_DATA,
    payload: request
  };
}
