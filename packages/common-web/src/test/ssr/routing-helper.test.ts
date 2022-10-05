import {describe, expect, test} from '@jest/globals';
import {routeOrdinal } from '../../ssr/routing-helpers';

describe("routeOrdinal", () => {

    test("/ should be 7 if max length is 3", () => {
        expect(routeOrdinal("/", 3)).toBe(7);
    });

    test("/a should be 7 if max length is 3", () => {
        expect(routeOrdinal("/a", 3)).toBe(7);
    });

    test("/a/b should be 7 if max length is 3", () => {
        expect(routeOrdinal("/a/b", 3)).toBe(7);
    });

    test("/a/b/c should be 7 if max length is 3", () => {
        expect(routeOrdinal("/a/b/c", 3)).toBe(7);
    });

    test("/:a should be 6 if max length is 3", () => {
        expect(routeOrdinal("/:a", 3)).toBe(3);
    });

    test("/a/b/:c should be 6 if max length is 3", () => {
        expect(routeOrdinal("/a/b/:c", 3)).toBe(6);
    });

    test("/a/:b should be 5 if max length is 3", () => {
        expect(routeOrdinal("/a/:b", 3)).toBe(5);
    });

    test("/a/:b/c should be 5 if max length is 3", () => {
        expect(routeOrdinal("/a/:b/c", 3)).toBe(5);
    });

    test("/a/:b/:c should be 4 if max length is 3", () => {
        expect(routeOrdinal("/a/:b/:c", 3)).toBe(4);
    });

    test("/:a/b should be 3 if max length is 3", () => {
        expect(routeOrdinal("/:a/b", 3)).toBe(3);
    });

    test("/:a/b/c should be 3 if max length is 3", () => {
        expect(routeOrdinal("/:a/b/c", 3)).toBe(3);
    });

    test("/:a/b/:c should be 2 if max length is 3", () => {
        expect(routeOrdinal("/:a/b/:c", 3)).toBe(2);
    });

    test("/:a/:b should be 1 if max length is 3", () => {
        expect(routeOrdinal("/:a/:b", 3)).toBe(1);
    });

    test("/:a/:b/c should be 1 if max length is 3", () => {
        expect(routeOrdinal("/:a/:b/c", 3)).toBe(1);
    });

    test("/:a/:b/:c should be 0 if max length is 3", () => {
        expect(routeOrdinal("/:a/:b/:c", 3)).toBe(0);
    });
});