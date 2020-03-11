import axios from 'axios';

export default (url, data, callback) =>
{
    axios({
        method: 'post',
        url: '/api/users/wecc',
        headers: { 
            'Content-Type': 'application/json'            
        },
        data: JSON.stringify(data),
        timeout: 5000
    })
    .then(response => {
        callback(null, response);
    })
    .catch(error => {
        callback(error, null);
    });
}