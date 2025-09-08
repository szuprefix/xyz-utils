import { describe, it, expect } from 'vitest';
import { Splitter, groups, mapItems, hierarchy } from '../../src/string/hierarchy'; // 替换成实际文件路径

describe('Splitter Function', () => {
    it('should split string into head, items, and splitters based on the regex', () => {
        const input = `which is not animal?A.apple B.boy C.cat D.dog`;
        const regex = /\s*([A-Z])[.。]/;
        const result = Splitter(regex)(input);

        expect(result.head).toBe('which is not animal?');
        expect(result.items).toEqual(['apple', 'boy', 'cat', 'dog']);
        expect(result.splitters).toEqual(['A', 'B', 'C', 'D']);
    });

    it('should handle edge cases where no valid split is found', () => {
        const input = 'a';
        const regex = /,/;
        const result = Splitter(regex)(input);

        expect(result.head).toBe('a');
        expect(result.items).toEqual([]);
        expect(result.splitters).toEqual([]);
    });
});

describe('groups Function', () => {
    it('should return grouped items with corresponding labels and text', () => {
        const input = {
            head: 'Header',
            items: ['item1', 'item2'],
            splitters: ['|', ','],
        };

        const result = groups(input);

        expect(result.head).toBe('Header');
        expect(result.items).toEqual([
            { label: '|', text: 'item1' },
            { label: ',', text: 'item2' },
        ]);
    });

    it('should return empty items when the input has no splitters', () => {
        const input = {
            head: 'Header',
            items: ['item1'],
            splitters: [],
        };

        const result = groups(input);

        expect(result.head).toBe('Header');
        expect(result.items).toEqual([{ label: undefined, text: 'item1' }]);
    });
});

describe('mapItems Function', () => {
    it('should map items based on splitters', () => {
        const input = {
            head: 'Header',
            items: ['item1', 'item2'],
            splitters: ['|', ','],
        };

        const result = mapItems(input);

        expect(result.head).toBe('Header');
        expect(result.items).toEqual({
            '|': 'item1',
            ',': 'item2',
        });
    });

    it('should handle cases with no items', () => {
        const input = {
            head: 'Header',
            items: [],
            splitters: [],
        };

        const result = mapItems(input);

        expect(result.head).toBe('Header');
        expect(result.items).toEqual({});
    });
});

describe('hierarchy Function', () => {
    it('should recursively split string into hierarchical structure', () => {
        const input = `选择题
        1. which is not animal?A.apple B.boy C.cat D.dog
        `;
        const splitters = [
            /\s*([0-9]+)[.。]/,
            /\s*([A-Z])[.。]/
        ];
        const result = hierarchy(input, splitters);

        expect(result.head).toBe('选择题');
        expect(result.items).toHaveLength(1);
        expect(result.items[0].head).toBe('which is not animal?');
        expect(result.items[0].items[0].head).toBe('apple');
    });

    it('should return trimmed head when no splitters left', () => {
        const input = 'a';
        const splitters = [];
        const result = hierarchy(input, splitters);

        expect(result.head).toBe('a');
    });

    it('should handle invalid splitters gracefully', () => {
        const input = 'a,b';
        const result = hierarchy(input, [null]);

        expect(result.head).toBe('a,b');
    });
});
