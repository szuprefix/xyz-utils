import { describe, it, expect, vi } from "vitest";
import { arrayNormalize } from "../../src/array/arrayNormalize";

// 假的模板数据
const templates = {
    foo: { type: "string", required: true },
    bar: { type: "number" },
};

describe("arrayNormalize", () => {
    it("should expand 'all' into all template keys", () => {
        const result = arrayNormalize("all", templates);
        expect(result).toEqual([
            { type: "string", required: true, name: "foo" },
            { type: "number", name: "bar" },
        ]);
    });

    it("should handle string item", () => {
        const result = arrayNormalize(["foo"], templates);
        expect(result).toEqual([{ type: "string", required: true, name: "foo" }]);
    });

    it("should handle array item (pass-through)", () => {
        const arrItem = [1, 2, 3];
        const result = arrayNormalize([arrItem], templates);
        expect(result).toEqual([arrItem]);
    });

    it("should merge object item with template", () => {
        const items = [{ name: "bar", extra: true }];
        const result = arrayNormalize(items, templates);
        expect(result).toEqual([{ type: "number", name: "bar", extra: true }]);
    });

    it("should call normalize function if provided", () => {
        const mockNormalize = vi.fn((d, i) => ({ ...d, index: i }));
        const result = arrayNormalize(["foo"], templates, mockNormalize);

        expect(mockNormalize).toHaveBeenCalledTimes(1);
        expect(mockNormalize).toHaveBeenCalledWith(
            { type: "string", required: true, name: "foo" },
            0
        );
        expect(result).toEqual([
            { type: "string", required: true, name: "foo", index: 0 },
        ]);
    });

    it("should handle empty items", () => {
        const result = arrayNormalize([], templates);
        expect(result).toEqual([]);
    });
});
