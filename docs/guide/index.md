# Installation

## Install Package

::: code-group
```shell [npm]
npm i @encolajs/validator
```

```shell [yarn]
yarn add @encolajs/validator
```

```shell [pnpm]
pnpm add @encolajs/validator
```
:::

## Basic Usage

Here's a simple example of how to use Encolajs Validator:

```javascript
import { createValidator } from '@encolajs/validator'

const validator = createValidator({
  name: 'string',
  age: 'number',
  email: 'email'
})

const data = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
}

const result = await validator.validate(data)
if (result.isValid) {
  console.log('Validation passed!')
} else {
  console.log('Validation failed:', result.errors)
}
```
