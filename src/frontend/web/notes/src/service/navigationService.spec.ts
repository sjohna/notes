import {describe,expect,test} from '@jest/globals';
import {
    matchRoute,
    NumberParameterPathElement, Route,
    SimplePathElement,
    StringParameterPathElement
} from "./navigationService";

describe('navigationService', () => {
    describe('simplePathElement', () => {
        test('matches', () => {
           const pathElement = new SimplePathElement('notes');
           const result = pathElement.matches('notes');
           expect(result.match).toBe(true);
        });

        test('does not match', () => {
          const pathElement = new SimplePathElement('notes');
          const result = pathElement.matches('tags');
          expect(result.match).toBe(false);
        });
    });


    describe('numberParameterPathElement', () => {
        test('is integer', () => {
            const element = new NumberParameterPathElement('id');
            const result = element.matches('123');
            expect(result.match).toBe(true);
            expect(result.data).toEqual({id: 123});
        });

        test('is float', () => {
            const element = new NumberParameterPathElement('id');
            const result = element.matches('123.45');
            expect(result.match).toBe(true);
            expect(result.data).toEqual({id: 123});
        });

        test('is not a number', () => {
            const element = new NumberParameterPathElement('id');
            const result = element.matches('abc');
            expect(result.match).toBe(false);
        });

        test('starts with integer', () => {
            const element = new NumberParameterPathElement('id');
            const result = element.matches('123abc');
            expect(result.match).toBe(true);
            expect(result.data).toEqual({id: 123});
        });

        test('is whitespace', () => {
            const element = new NumberParameterPathElement('id');
            const result = element.matches(' ');
            expect(result.match).toBe(false);
        });
    });

    describe('stringParameterPathElement', () => {
        test('basic case', () => {
            const element = new StringParameterPathElement('tag');
            const result = element.matches('something');
            expect(result.match).toBe(true);
            expect(result.data).toEqual({tag: 'something'});
        });

        test('with whitespace', () => {
            const element = new StringParameterPathElement('tag');
            const result = element.matches('something else');
            expect(result.match).toBe(true);
            expect(result.data).toEqual({tag: 'something else'});
        });

        test('value is number', () => {
            const element = new StringParameterPathElement('tag');
            const result = element.matches('123');
            expect(result.match).toBe(true);
            expect(result.data).toEqual({tag: '123'});
        });

        test('value is empty', () => {
            const element = new StringParameterPathElement('tag');
            const result = element.matches('');
            expect(result.match).toBe(false);
        });

        test('value is whitespace', () => {
            const element = new StringParameterPathElement('tag');
            const result = element.matches(' ');
            expect(result.match).toBe(false);
        });
    });

    describe('matchRoute', () => {
        const simpleRoute: Route = {
            path: [
                new SimplePathElement('notes'),
            ],
        }

        test('match simple case', () => {
            const result = matchRoute(simpleRoute, ['notes']);
            expect(result.match).toBe(true);
            expect(result.data).toEqual({});
            expect(result.remainingPath).toEqual([]);
        });

        test('match simple case with extra path parts', () => {
            const result = matchRoute(simpleRoute, ['notes', '123']);
            expect(result.match).toBe(true);
            expect(result.data).toEqual({});
            expect(result.remainingPath).toEqual(['123']);
        });

        test('no path parts in simple case', () => {
            const result = matchRoute(simpleRoute, []);
            expect(result.match).toBe(false);
        });

        test('no match in simple case', () => {
            const result = matchRoute(simpleRoute, ['tags']);
            expect(result.match).toBe(false);
        });

        const simpleRouteWithData: Route = {
            path: [
                new SimplePathElement('notes'),
            ],
            data: {
                test: 'test',
            },
        }

        test('match simple case with data', () => {
            const result = matchRoute(simpleRouteWithData, ['notes']);
            expect(result.match).toBe(true);
            expect(result.data).toEqual({test: 'test'});
            expect(result.remainingPath).toEqual([]);
        });

        test('match simple case with data and extra path parts', () => {
            const result = matchRoute(simpleRouteWithData, ['notes', '123']);
            expect(result.match).toBe(true);
            expect(result.data).toEqual({test: 'test'});
            expect(result.remainingPath).toEqual(['123']);
        });

        const numberParameterRoute: Route = {
            path: [
                new SimplePathElement('notes'),
                new NumberParameterPathElement('id'),
            ],
            data: {
                test: 'test',
            }
        }

        test('match number parameter case', () => {
            const result = matchRoute(numberParameterRoute, ['notes', '123']);
            expect(result.match).toBe(true);
            expect(result.data).toEqual({test: 'test', id: 123});
            expect(result.remainingPath).toEqual([]);
        });

        test('match number parameter case with extra path parts', () => {
            const result = matchRoute(numberParameterRoute, ['notes', '123', 'tags']);
            expect(result.match).toBe(true);
            expect(result.data).toEqual({test: 'test', id: 123});
            expect(result.remainingPath).toEqual(['tags']);
        });

        test('no match due to non-numeric parameter', () => {
            const result = matchRoute(numberParameterRoute, ['notes', 'abc']);
            expect(result.match).toBe(false);
        });

        test('no match due to missing parameter', () => {
            const result = matchRoute(numberParameterRoute, ['notes']);
            expect(result.match).toBe(false);
        });

        test('no match due to not matching first path element', () => {
            const result = matchRoute(numberParameterRoute, ['tags', '123']);
            expect(result.match).toBe(false);
        });

        const multipleParameterRoute: Route = {
            path: [
                new SimplePathElement('notes'),
                new NumberParameterPathElement('id'),
                new StringParameterPathElement('tag'),
            ],
            data: {
                test: 'test',
            }
        }

        test('match multiple parameter case', () => {
            const result = matchRoute(multipleParameterRoute, ['notes', '123', 'test']);
            expect(result.match).toBe(true);
            expect(result.data).toEqual({test: 'test', id: 123, tag: 'test'});
            expect(result.remainingPath).toEqual([]);
        });

        test('match multiple parameter case with extra path parts', () => {
            const result = matchRoute(multipleParameterRoute, ['notes', '123', 'test', 'something']);
            expect(result.match).toBe(true);
            expect(result.data).toEqual({test: 'test', id: 123, tag: 'test'});
            expect(result.remainingPath).toEqual(['something']);
        });

        test('no match due to non-numeric parameter', () => {
            const result = matchRoute(multipleParameterRoute, ['notes', 'abc', 'test']);
            expect(result.match).toBe(false);
        });

        test('no match due to missing parameter', () => {
            const result = matchRoute(multipleParameterRoute, ['notes', '123']);
            expect(result.match).toBe(false);
        });

        test('no match due to not matching first path element', () => {
            const result = matchRoute(multipleParameterRoute, ['tags', '123', 'test']);
            expect(result.match).toBe(false);
        });
    });
});