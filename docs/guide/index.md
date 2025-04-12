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

const isValid = await validator.validate(data)
if (isValid) {
  console.log('Validation passed!')
} else {
  console.log('Validation failed:', validator.getErrors())
}
```
