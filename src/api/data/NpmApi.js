import request from "request";

export class NpmApi {
    static TIME_POINT_LAST_MONTH = 'last-month';
    static TIME_POINT_LAST_WEEK = 'last-week';
    static TIME_POINT_LAST_DAY = 'last-day';

    info(pkgName) {
        return this.request(`https://registry.npmjs.org/${pkgName}`);
    }

    downloads(packageName, point = NpmApi.TIME_POINT_LAST_MONTH) {
        return this.request(`https://api.npmjs.org/downloads/point/${point}/${packageName}`);
    }

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
