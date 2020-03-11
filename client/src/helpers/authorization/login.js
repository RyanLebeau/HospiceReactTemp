import axios from 'axios';

export default (data, callback) =>
{
    axios({
        method: 'post',
        url: '/api/users/login',
        headers: { 
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data),
        timeout: 5000
    })
    .then(response => {
        callback(null, response);
    })
    .catch(error => {
        callback(error.response, null);
    });
}