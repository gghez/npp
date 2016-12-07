import { RestApiBase } from "./RespApiBase";

export class NpmApi extends RestApiBase {
    static TIME_POINT_LAST_MONTH = 'last-month';
    static TIME_POINT_LAST_WEEK = 'last-week';
    static TIME_POINT_LAST_DAY = 'last-day';

    info(pkgName) {
        return this.request(`https://registry.npmjs.org/${pkgName}`);
    }

    downloads(packageName, point = NpmApi.TIME_POINT_LAST_MONTH) {
        return this.request(`https://api.npmjs.org/downloads/point/${point}/${packageName}`);
    }
}
