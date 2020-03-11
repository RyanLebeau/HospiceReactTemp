import axios from 'axios';

export default (token, callback) =>
{
    axios({
        method: 'get',
        url: '/api/users/validate',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        timeout: 5000
    })
    .then(response => {
        callback(null, response);
    })
    .catch(error => {
        callback(error, null);
    });
}