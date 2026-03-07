import axios from 'axios';

const visitorApi = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true
});

export default visitorApi;
