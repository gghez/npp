jest.mock('request');

import { NpmApi } from "../../../src/api/data/NpmApi";
import request from "request";

beforeEach(() => {
    request.mockClear();
});

test('info() relies on correct NPM rest url', async () => {
    const api = new NpmApi();
    await api.info('pkg');

    expect(request).toHaveBeenCalled();
    expect(request.mock.calls[0][0]).toEqual('https://registry.npmjs.org/pkg');
});

test('downloads() relies on correct NPM rest url', async () => {
    const api = new NpmApi();
    await api.downloads('pkg');

    expect(request).toHaveBeenCalled();
    expect(request.mock.calls[0][0]).toEqual('https://api.npmjs.org/downloads/point/last-month/pkg');
});
