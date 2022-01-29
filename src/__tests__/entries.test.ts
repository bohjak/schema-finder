import {buildSchemaEntries} from "../entries";
import {SchemaEntry} from "../internal";

describe("buildSchemaEntries", () => {
  it("dereferences sub schemas", async () => {
    const deref = jest.fn().mockResolvedValue([{}]);
    const $ref = "https://example.com";
    const parent: SchemaEntry = {
      deref,
      key: "parent",
      name: "Parent Node",
      schema: {properties: {foo: {$ref}}, items: [{$ref}]},
    };

    await buildSchemaEntries(parent);

    expect(deref).toHaveBeenCalledTimes(2);
    expect(deref).toHaveBeenCalledWith($ref);
  });

  it("folds in child anyOf", async () => {
    const deref = jest.fn().mockResolvedValue([{}]);
    const parent: SchemaEntry = {
      deref,
      key: "parent",
      name: "Parent Node",
      schema: {items: {anyOf: [{title: "Foo"}, {title: "Bar"}]}},
    };

    const result = await buildSchemaEntries(parent);

    expect(result.map((e) => [e.name, e.schema])).toMatchInlineSnapshot(`
      Array [
        Array [
          "Foo",
          Object {
            "title": "Foo",
          },
        ],
        Array [
          "Bar",
          Object {
            "title": "Bar",
          },
        ],
      ]
    `);
  });

  it("dereferences and folds in child anyOf", async () => {
    const title = "Baz";
    const deref = jest.fn().mockResolvedValue([{title}]);
    const parent: SchemaEntry = {
      deref,
      key: "parent",
      name: "Parent Node",
      schema: {
        items: {anyOf: [{$ref: "reference"}]},
      },
    };

    const result = await buildSchemaEntries(parent);

    expect(deref).toHaveBeenCalledTimes(1);

    expect(result).toHaveLength(1);
    expect(result[0].schema).toMatchInlineSnapshot(`
      Object {
        "$ref": "reference",
        "title": "Baz",
      }
    `);
  });

  it("dereferences direct descendants", async () => {
    const deref = jest.fn().mockResolvedValue([{}]);
    const parent: SchemaEntry = {
      deref,
      key: "parent",
      name: "Parent Node",
      schema: {
        additionalProperties: {
          $ref: "#",
        },
      },
    };
  });
});
