import { describe, it, expect } from 'vitest'
import defaultMessageFormatter from '../../src/util/defaultMessageFormatter'
import { GreaterThanOrEqualRule } from '../../src/rule/GreaterThanOrEqual'
import { RequiredRule } from '../../src/rule/Required'

describe('defaultMessageFormatter', () => {
  it('should use exact path match for custom messages', () => {
    const customMessages = {
      'items.1.price:required': 'Price is required for item 1'
    }
    
    const context = {
      _customMessages: customMessages,
      _ruleRegistry: {
        getDefaultMessage: () => 'Field is required'
      }
    }
    
    const rule = new RequiredRule()
    const result = defaultMessageFormatter.call(
      context,
      'required',
      undefined,
      'items.1.price',
      rule
    )
    
    expect(result).toBe('Price is required for item 1')
  })
  
  it('should match wildcard patterns in custom messages', () => {
    const customMessages = {
      'items.*.price:required': 'Price is required for this item'
    }
    
    const context = {
      _customMessages: customMessages,
      _ruleRegistry: {
        getDefaultMessage: () => 'Field is required'
      }
    }
    
    const rule = new RequiredRule()
    const result = defaultMessageFormatter.call(
      context,
      'required',
      undefined,
      'items.1.price',
      rule
    )
    
    expect(result).toBe('Price is required for this item')
  })
  
  it('should match multiple wildcard patterns', () => {
    const customMessages = {
      'orders.*.items.*.price:required': 'Price is required for nested item'
    }
    
    const context = {
      _customMessages: customMessages,
      _ruleRegistry: {
        getDefaultMessage: () => 'Field is required'
      }
    }
    
    const rule = new RequiredRule()
    const result = defaultMessageFormatter.call(
      context,
      'required',
      undefined,
      'orders.0.items.1.price',
      rule
    )
    
    expect(result).toBe('Price is required for nested item')
  })
  
  it('should prefer exact match over wildcard match', () => {
    const customMessages = {
      'items.*.price:required': 'Price is required for this item',
      'items.1.price:required': 'Price is required for item 1 specifically'
    }
    
    const context = {
      _customMessages: customMessages,
      _ruleRegistry: {
        getDefaultMessage: () => 'Field is required'
      }
    }
    
    const rule = new RequiredRule()
    const result = defaultMessageFormatter.call(
      context,
      'required',
      undefined,
      'items.1.price',
      rule
    )
    
    expect(result).toBe('Price is required for item 1 specifically')
  })
  
  it('should use default message when no custom message matches', () => {
    const customMessages = {
      'items.*.quantity:required': 'Quantity is required'
    }
    
    const context = {
      _customMessages: customMessages,
      _ruleRegistry: {
        getDefaultMessage: () => 'Field is required'
      }
    }
    
    const rule = new RequiredRule()
    const result = defaultMessageFormatter.call(
      context,
      'required',
      undefined,
      'items.1.price',
      rule
    )
    
    expect(result).toBe('Field is required')
  })
  
  it('should replace placeholders in custom messages', () => {
    const customMessages = {
      'items.*.price:min': 'Price must be at least {param:0} for {field}'
    }
    
    const context = {
      _customMessages: customMessages,
      _ruleRegistry: {
        getDefaultMessage: () => 'Field must be at least {param:0}'
      }
    }
    
    const rule = new GreaterThanOrEqualRule([10])
    const result = defaultMessageFormatter.call(
      context,
      'min',
      5,
      'items.1.price',
      rule
    )
    
    expect(result).toBe('Price must be at least 10 for items.1.price')
  })
})