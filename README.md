# Schema Finder

> A friendly companion for JSONSchema exploration

Licensed under the [Unlicense].

This package started as a drop-in replacement for [React JSON Schema Inspector]
with proper support for references, arrays, titles, and any combination thereof.

## Roadmap

- [x] Styled Components migration
- [x] Simplify schema tree (stop showing _properties_ layers)
  - [x] Support properties
  - [x] Support items
  - [x] Support annotations
  - [x] Schema info
  - [x] Show if a property is required
  - [x] Fix path
- [ ] Component library injection
- [ ] Have boolean and conditional keywords act on parent schemas
- [ ] Explore decoupling of JSONSchema specific code and supporting multiple
      schemas
- [ ] Get rid of Storybook
- [ ] Separate the package from dev demo
- [ ] Add a flag for enabling URL based $ref resolution

## Dev Setup

1. Install packages with `pnpm`
   ```
   pnpm i
   ```
1. Run Storybook on port `6006` (HMR seems to be somewhat broken)
   ```
   pnpm storybook
   ```

## Publish

1. Install packages
   ```
   pnpm i
   ```
1. Build
   ```
   pnpm build
   ```
1. Publish (for the time being both versioning and publishing is done manually)

[react json schema inspector]:
  https://github.com/CarstenWickner/react-jsonschema-inspector
[unlicense]: ./LICENSE
