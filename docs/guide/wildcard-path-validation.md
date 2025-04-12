## Pattern Matching Validation

### Wildcard Path Validation

Use wildcards to validate array items with consistent patterns:

```javascript
const validator = factory.make({
  // Validate all array items
  'users.*.email': 'required|email',
  'users.*.role': 'required|in_list:admin,user',
  
  // Nested arrays
  'departments.*.employees.*.id': 'required|integer',
  
  // Mix of specific and wildcard indices
  'config[0].enabled': 'required|boolean',
  'config.*.settings.timeout': 'required|integer|min:1000'
})

const data = {
  users: [
    { email: 'user1@example.com', role: 'admin' },
    { email: 'user2@example.com', role: 'user' }
  ],
  departments: [
    {
      employees: [
        { id: 1 },
        { id: 2 }
      ]
    }
  ],
  config: [
    { 
      enabled: true,
      settings: { timeout: 2000 }
    },
    {
      enabled: false,
      settings: { timeout: 1500 }
    }
  ]
}
```
