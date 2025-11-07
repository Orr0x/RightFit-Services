/**
 * Button Accessibility Tests
 *
 * Tests WCAG 2.1 AA compliance for Button component
 */

import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '../Button'

// Extend expect with axe matchers
expect.extend(toHaveNoViolations)

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('disabled button has proper ARIA attributes', async () => {
    const { container } = render(<Button disabled>Disabled Button</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('loading button has proper ARIA attributes', async () => {
    const { container } = render(<Button loading>Loading Button</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()

    const button = container.querySelector('button')
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('button with icon has proper aria-label', async () => {
    const Icon = () => <svg aria-hidden="true"><path d="M0 0h24v24H0z" /></svg>
    const { container } = render(
      <Button icon={<Icon />} aria-label="Delete item">
        Delete
      </Button>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()

    const button = container.querySelector('button')
    expect(button).toHaveAttribute('aria-label', 'Delete item')
  })

  it('icon-only button has aria-label', async () => {
    const Icon = () => <svg aria-hidden="true"><path d="M0 0h24v24H0z" /></svg>
    const { container } = render(
      <Button icon={<Icon />} aria-label="Menu" iconOnly />
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()

    const button = container.querySelector('button')
    expect(button).toHaveAttribute('aria-label', 'Menu')
  })

  it('has sufficient color contrast for all variants', async () => {
    const variants = ['primary', 'secondary', 'danger', 'success', 'warning']

    for (const variant of variants) {
      const { container } = render(<Button variant={variant}>{variant}</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    }
  })

  it('maintains accessibility when focused', async () => {
    const { container } = render(<Button>Focusable Button</Button>)
    const button = container.querySelector('button')
    button?.focus()

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('form submit button has correct type attribute', async () => {
    const { container } = render(<Button type="submit">Submit Form</Button>)

    const results = await axe(container)
    expect(results).toHaveNoViolations()

    const button = container.querySelector('button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})
