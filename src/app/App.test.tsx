import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '@/app/App'
import i18n from '@/i18n'
import csCommon from '@/i18n/cs/common'
import csDartboard from '@/i18n/cs/dartboard'
import csBestline from '@/i18n/cs/bestline'
import enBestline from '@/i18n/en/bestline'
import enCommon from '@/i18n/en/common'
import enDartboard from '@/i18n/en/dartboard'
import csRegion from '@/i18n/cs/region'
import enRegion from '@/i18n/en/region'

async function setLanguage(language: 'cs' | 'en') {
  await act(async () => {
    await i18n.changeLanguage(language)
  })
}

beforeEach(() => {
  window.location.hash = '#/'
})

afterEach(async () => {
  await setLanguage('en')
})

describe('application shell', () => {
  it('renders the overview in English', async () => {
    await setLanguage('en')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: enCommon.home.heading })).toBeDefined()
    expect(screen.getByText(enCommon.scenarios['01-dartboard'].title)).toBeDefined()
  })

  it('switches to Czech without reloading', async () => {
    await setLanguage('en')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: enCommon.language.cs }))
    expect(screen.getByRole('heading', { level: 1, name: csCommon.home.heading })).toBeDefined()
    expect(screen.getByText(csCommon.scenarios['01-dartboard'].title)).toBeDefined()
    expect(document.documentElement.lang).toBe('cs')
  })

  it('lists the planned scenarios as not yet implemented', async () => {
    await setLanguage('en')
    render(<App />)
    expect(screen.getAllByText(enCommon.status.planned)).toHaveLength(4)
    expect(screen.getAllByText(enCommon.status.available)).toHaveLength(3)
  })

  it('shows a notice for a scenario that is only planned', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/05-miracle-drug'
    render(<App />)
    expect(screen.getByText(enCommon.scenario.planned.body)).toBeDefined()
  })
})

describe('dartboard scenario', () => {
  it('walks through the lifecycle in both languages', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/01-dartboard'
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: enDartboard.intro.heading })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enDartboard.intro.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enDartboard.experiment.heading }),
    ).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enDartboard.experiment.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enDartboard.observation.heading }),
    ).toBeDefined()

    await setLanguage('cs')
    expect(
      screen.getByRole('heading', { level: 2, name: csDartboard.observation.heading }),
    ).toBeDefined()
  })

  it('validates on fresh darts, however the stage is reached', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/01-dartboard'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enDartboard.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enDartboard.experiment.action }))
    fireEvent.click(screen.getByRole('button', { name: enDartboard.observation.action }))
    fireEvent.click(screen.getByRole('button', { name: enDartboard.analysis.action }))

    // The legend must describe what is actually on the board: new, independent darts.
    expect(screen.getAllByText(enDartboard.validation.freshData).length).toBeGreaterThan(0)
    expect(screen.queryByText(enDartboard.board.legendDart)).toBeNull()

    // Going back and returning through the step indicator keeps the fresh data.
    fireEvent.click(screen.getByRole('button', { name: `3. ${enCommon.stages.observation}` }))
    expect(screen.getByText(enDartboard.board.legendDart)).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: `5. ${enCommon.stages.validation}` }))
    expect(screen.getAllByText(enDartboard.validation.freshData).length).toBeGreaterThan(0)
  })

  it('captures more darts after the target is placed automatically', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/01-dartboard'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enDartboard.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enDartboard.experiment.action }))

    const capturedBefore = screen.getByText(enDartboard.stats.capturedNow).nextSibling?.textContent
    fireEvent.click(screen.getByRole('button', { name: enDartboard.observation.auto }))
    const capturedAfter = screen.getByText(enDartboard.stats.capturedNow).nextSibling?.textContent

    expect(Number(capturedAfter)).toBeGreaterThan(Number(capturedBefore))
  })
})

describe('best line scenario', () => {
  it('walks through the lifecycle in both languages', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/02-best-line'
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: enBestline.intro.heading })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enBestline.intro.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enBestline.experiment.heading }),
    ).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enBestline.experiment.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enBestline.observation.heading }),
    ).toBeDefined()

    await setLanguage('cs')
    expect(
      screen.getByRole('heading', { level: 2, name: csBestline.observation.heading }),
    ).toBeDefined()
  })

  it('will not run the F-test on a hand-drawn line, but will once a model is fitted', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/02-best-line'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enBestline.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enBestline.experiment.action }))

    const advance = screen.getByRole('button', { name: enBestline.observation.action })
    expect(advance.hasAttribute('disabled')).toBe(true)
    expect(screen.getAllByText(enBestline.stats.notApplicable).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: enBestline.observation.autoBest }))
    expect(
      screen.getByRole('button', { name: enBestline.observation.action }).hasAttribute('disabled'),
    ).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: enBestline.observation.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enBestline.analysis.heading }),
    ).toBeDefined()
  })
})

describe('interesting region scenario', () => {
  it('walks through the lifecycle in both languages', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/03-interesting-region'
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: enRegion.intro.heading })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enRegion.intro.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enRegion.experiment.heading }),
    ).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enRegion.experiment.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enRegion.observation.heading }),
    ).toBeDefined()

    await setLanguage('cs')
    expect(
      screen.getByRole('heading', { level: 2, name: csRegion.observation.heading }),
    ).toBeDefined()
  })

  it('turns an unremarkable record into a finding once the search is allowed', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/03-interesting-region'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enRegion.intro.action }))
    // The stretch fixed in advance finds nothing.
    expect(screen.getAllByText(enRegion.analysis.verdictNothing).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: enRegion.experiment.action }))
    fireEvent.click(screen.getByRole('button', { name: enRegion.observation.autoBest }))
    expect(screen.getAllByText(enRegion.analysis.verdictStriking).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: enRegion.observation.action }))
    expect(screen.getByRole('heading', { level: 2, name: enRegion.analysis.heading })).toBeDefined()
    // Both verdicts stand side by side under the identical test.
    expect(screen.getAllByText(enRegion.analysis.verdictNothing).length).toBeGreaterThan(0)
    expect(screen.getAllByText(enRegion.analysis.verdictStriking).length).toBeGreaterThan(0)
  })

  it('validates on a new record, whichever way the stage is reached', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/03-interesting-region'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enRegion.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enRegion.experiment.action }))
    fireEvent.click(screen.getByRole('button', { name: enRegion.observation.autoBest }))
    fireEvent.click(screen.getByRole('button', { name: enRegion.observation.action }))
    fireEvent.click(screen.getByRole('button', { name: enRegion.analysis.action }))

    expect(
      screen.getByRole('heading', { level: 2, name: enRegion.validation.heading }),
    ).toBeDefined()
    // The legend must say that what is on screen is a new, independent record.
    expect(screen.getAllByText(enRegion.validation.freshData).length).toBeGreaterThan(0)
  })
})
