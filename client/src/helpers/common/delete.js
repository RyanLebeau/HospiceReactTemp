// ============================================
// Sends a DELETE request to server using axios
// ============================================
import axios from 'axios';

export default (url, token, callback) =>
{
    axios({
        method: 'delete',
        url: '/api/' + url,
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