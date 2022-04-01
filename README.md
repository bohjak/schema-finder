# Schema Finder

> Explore, modify, and create JSONSchema instances.

Licensed under the [Unlicense].

This library started out as a drop-in replacement for [React JSON Schema
Inspector] with better support for complex array types. It is being developed
against the [JSONSchema Draft 7], so it doesn't have a full support for some of
the features of the newer drafts, but should still display them reasonably well.

## Development

```sh
# Clone
git clone https://github.com/jamesbohacek/schema-finder.git
cd schema-finder

# Install packages
pnpm i

# Run dev server with an example page
pnpm dev

# Build
pnpm build
```

[react json schema inspector]:
  https://github.com/CarstenWickner/react-jsonschema-inspector
[unlicense]: ./LICENSE
[jsonschema draft 7]: https://json-schema.org/specification-links.html#draft-7
