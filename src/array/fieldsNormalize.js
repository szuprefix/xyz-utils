/**
 * 从 jsonList 中提取指定字段的 schema
 * @param {Array<string|{name: string, type?: string}>} fieldSpecs - 字段规范列表
 * @param {Array<Object>} jsonList - JSON 对象数组
 * @returns {Array<{name: string, type: string}>} - 标准化后的字段 schema
 */
function normalizeFields(fieldSpecs, jsonList) {
    // 类型推断辅助函数
    function inferType(value) {
        if (value === null) return 'null';
        const t = typeof value;
        if (t === 'string') return 'string';
        if (t === 'boolean') return 'boolean';
        if (t === 'object') {
            if (Array.isArray(value)) return 'array';
            return 'object';
        }
        if (t === 'number') {
            if (Number.isInteger(value)) return 'integer';
            return 'number';
        }
        return 'any';
    }

    // 从数据中推断字段类型（考虑多个样本）
    function inferFieldType(fieldName, dataList) {
        const types = new Set();
        let sampleCount = 0;
        const MAX_SAMPLES = 100; // 避免大数据量全扫描

        for (const item of dataList) {
            if (sampleCount >= MAX_SAMPLES) break;
            if (item && typeof item === 'object' && fieldName in item) {
                const val = item[fieldName];
                const inferred = inferType(val);
                types.add(inferred);
                sampleCount++;
            }
        }

        if (types.size === 0) return 'any'; // 未找到该字段
        if (types.size === 1) {
            return [...types][0];
        }

        // 多种类型：尝试合并 integer -> number
        if (types.has('integer') && types.has('number')) {
            types.delete('integer');
            if (types.size === 1) return 'number';
        }

        // 其他混合类型统一为 'any'
        return 'any';
    }

    // 标准化 fieldSpec
    return fieldSpecs.map(spec => {
        let name, type;

        if (typeof spec === 'string') {
            name = spec;
            type = null; // 需要推断
        } else if (typeof spec === 'object' && spec.name) {
            name = spec.name;
            type = spec.type || null;
        } else {
            throw new Error(`Invalid field spec:  $ {JSON.stringify(spec)}`);
        }

        // 如果未提供 type，则从 jsonList 推断
        if (!type) {
            type = inferFieldType(name, jsonList);
        }

        return { name, type };
    });
}
