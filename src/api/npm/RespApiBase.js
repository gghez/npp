import request from "request";

export class RestApiBase {
    request(url) {
        let promise = new Promise((resolve, reject) => {
            request(url, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        resolve(JSON.parse(res.body));
                    } catch (ex) {
                        reject(ex);
                    }
                }
            });
        });

        return promise;
    }
}
