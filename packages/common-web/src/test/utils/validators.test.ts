import {describe, expect, test} from '@jest/globals';
import { PLUGIN_REGEX } from "../../utils/validators";

describe("regexes", () => {
    describe("PLUGIN_REGEX",  () => {
        test("matches following", () => {
            expect(PLUGIN_REGEX.test("regex-with-hyphens")).toEqual(true);
            expect(PLUGIN_REGEX.test("regex_with_underscore")).toEqual(true);
        });

        test("does not match following", () => {
            expect(PLUGIN_REGEX.test("UPPERCASE")).toEqual(false);
            expect(PLUGIN_REGEX.test("_starts_with_underscore")).toEqual(false);
        });
    });
});