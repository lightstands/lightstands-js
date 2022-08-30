# lightstands-js

TypeScript/JavaScript LightStands client library

## Installation

- `pnpm add @lightstands/lightstands-js`
- `yarn add @lightstands/lightstands-js`
- `npm i --save @lightstands/lightstands-js`

## Early Access Warning

LightStands server software, stands web application and this library is still in unstable stage, the API may be changed frequently.

## Usage

LightStandsJS is designed in functional programming pattern for better tree-shaking support.

Most supported endpoint will end up a function, and expect a `ClientConfig` as the first argument.

```ts
import { ClientConfig, get204, aeither } from "@lightstands/lightstands-js"

const client: ClientConfig = {
  endpointBase: "https://api.lightstands.xyz/moutsea/",
  clientId: "<client id>",
  clientSecret: "<client secret>",
}

aeither({
  left: (e) => console.log("failed to connect LightStands"),
  right: (v) => v,
}, get204())
```

It's very recommended to use TypeScript since the whole library is bulit around TypeScript type system.

## Contributing

You should clone submodules when cloning this repository:
```
git clone --recursive https://github.com/lightstands/lightstands-js.git
```

If you already clone without submodules, use `git submodule update` to clone submodules.

Maintainer: `Rubicon <rubicon lightstands.xyz>` (Replace the space with at symbol)

## License
MIT License, see `LICENSE`.

If you contributed any file in this software, you are a "contributor". You, a contributor, hereby be granted:

- the permission to add your identity to `CONTRIBUTORS` file, to become a "registered contributor".

You must grant anyone that is:

- contributing this software
- using this software under the `LICENSE`

with:

- the permission to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software and to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of any material is required to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software.
