import {JSONSchema7} from "json-schema";
import {createColumn} from "../entries";

const deref = <T>(x: T): [T] => {
  return [x];
};

describe("createColumn", () => {
  describe("given a schema with no properties", () => {
    const schema: JSONSchema7 = {
      properties: {},
    };

    it("returns an empty array", () => {
      const result = createColumn(deref, [], schema);

      expect(result).toHaveLength(0);
    });
  });

  describe("given a schema with one property", () => {
    const schema: JSONSchema7 = {
      properties: {
        prop1: {
          title: "Title",
          type: "string",
        },
      },
      required: ["prop1"],
    };

    it("creates an entry", () => {
      const result = createColumn(deref, ["#"], schema);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchInlineSnapshot(`
        Object {
          "group": "properties",
          "hasChildren": false,
          "idx": 0,
          "isRequired": true,
          "key": "prop1",
          "name": "Title",
          "path": Array [
            "#",
            "prop1",
          ],
          "schema": Object {
            "title": "Title",
            "type": "string",
          },
        }
      `);
    });
  });

  describe("given a nested schema", () => {
    const schema: JSONSchema7 = {
      properties: {
        prop1: {
          type: "object",
          properties: {
            prop11: {
              type: "string",
            },
          },
        },
        prop2: {
          type: "object",
          properties: {},
        },
      },
    };

    it("identifies props with children", () => {
      const result = createColumn(deref, ["#"], schema);

      expect(result).toHaveLength(2);
      expect(result[0].hasChildren).toBeTruthy();
      expect(result[1].hasChildren).toBeFalsy();
    });
  });

  describe("given a schema with arrays", () => {
    const schema: JSONSchema7 = {
      items: {
        anyOf: [{title: "A"}, {title: "B"}],
      },
    };

    it("works", () => {
      expect(createColumn(deref, [], schema)).toMatchInlineSnapshot(`
        Array [
          Object {
            "group": "items",
            "hasChildren": false,
            "idx": 0,
            "isRequired": undefined,
            "key": "anyOf",
            "name": "anyOf",
            "path": Array [
              "anyOf",
            ],
            "schema": Array [
              Object {
                "title": "A",
              },
              Object {
                "title": "B",
              },
            ],
          },
        ]
      `);
    });
  });
});
