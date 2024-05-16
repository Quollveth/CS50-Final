import $ from 'jquery';
import { SERVER_IP,routes } from '../../constants';


export const validateSession = (session:string):Promise<{valid:boolean,token:string}> => {
    return new Promise((resolve, reject) => {
        $.post(`${SERVER_IP}${routes.validate}`, {token:session})
        .done(function (response) {
            resolve(response);
        })
        .fail(function (response) {
            reject(new Error(`Request failed`));
        })
    });
}