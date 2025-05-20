# @encolajs/validator

🚀 A powerful, flexible validation library that makes complex validation scenarios a breeze! Built with TypeScript and designed with developer experience in mind.

![CI](https://github.com/encolajs/encolajs-validator/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/@encolajs%2Fvalidator.svg)](https://badge.fury.io/js/@encolajs%2Fvalidator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Why Another Validation Library?

Most validation libraries work great with simple data structures, but real-world applications are messy! We built this library to handle the tough scenarios:

- 🌳 **Deep Object Validation**: Validate nested objects and arrays with ease
- 🔄 **Cross-Field Validation**: Reference other field values in your rules
- 🛠 **Extensible**: Create custom rules with minimal boilerplate
- 🌍 **i18n Ready**: Easily integrate your translation service
- 🎯 **Type-Safe**: Full TypeScript support, works great with strongly-typed models
- 🪶 **Light**: 20Kb minified, 5Kb gzipped
- 🎨 **Framework Agnostic**: Use it with any UI framework

## Quick Start

```bash
# Using npm
npm install @encolajs/validator

# Using yarn
yarn add @encolajs/validator

# Using pnpm
pnpm add @encolajs/validator
```

## Simple Example

```typescript
import { ValidatorFactory } from '@encolajs/validator'

const factory = new ValidatorFactory()

// Define validation rules
const validator = factory.make({
  'email': 'required|email',
  'password': 'required|password:8,32',
  'profile.name': 'required|min_length:2',
  'items.*.quantity': 'required|integer|min:1'
})

// Validate data
const data = {
  email: 'user@example.com',
  password: 'SecurePass123!',
  profile: {
    name: 'John'
  },
  items: [
    { quantity: 2 },
    { quantity: 3 }
  ]
}

const isValid = await validator.validate(data)
```

## Amazing Features

### Powerful Rule Chain

Chain rules together for complex validation scenarios:

```typescript
const rules = {
  'card_type': 'required|in_list:visa,mastercard',
  'card_number': 'required_if:card_type,visa|matches:^4\\d{15}$',
  'expiry_date': 'required|date_format:MM/YY|date_after:now',
  'items.*.price': 'required|number|min:0.01',
  'total': 'required|number|gte:@subtotal'
}
```

### Easy i18n Integration

Translate validation messages by bringing your own custom message formatter:

```typescript
const validator = factory.make(rules, {
  messageFormatter: (ruleName, value, path, rule) => {
    const message = factory._ruleRegistry.getDefaultMessage(ruleName)
    return i18n.translate(message, { value, path })
  }
})
```

## Documentation

[www.encolajs.com/validator/](https://www.encolajs.com/validator/)

## Contributing

We'd love your help improving @encolajs/validator! Check out our [Contributing Guide](./CONTRIBUTING.md) to get started.

Found a bug? [Open an issue](https://github.com/encolajs/validator/issues/new?template=bug_report.md)

Have a great idea? [Suggest a feature](https://github.com/encolajs/validator/issues/new?template=feature_request.md)

## License

MIT © [EncolaJS](https://github.com/encolajs)

---

Built with ❤️ by the EncolaJS team