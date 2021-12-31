# Schema Finder

> A friendly companion for JSONSchema exploration

Licensed under the [Unlicense].

This package started as a drop-in replacement for [React JSON Schema Inspector]
with proper support for references, arrays, titles, and any combination thereof.

Developped against JSONSchema7.

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
