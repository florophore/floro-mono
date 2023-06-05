import container from './test_utils/testContainer';
import { test } from 'mocha';
import StorageAuthenticator from '../StorageAuthenticator';

import "./test_utils/setupGlobal";

describe("testing", () => {
    test("it", () => {
        const auth = container.get(StorageAuthenticator);
        const url = "http://localhost:9000/private-cdn/testing/this/out.tar.gz"
        const signed = auth.signURL(url, 'testing/this/out.tar.gz', 60);
        console.log(signed);
    })
})