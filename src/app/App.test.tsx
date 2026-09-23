import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '@/app/App'
import i18n, { missingInterpolations } from '@/i18n'
import csCommon from '@/i18n/cs/common'
import csDartboard from '@/i18n/cs/dartboard'
import csBestline from '@/i18n/cs/bestline'
import enBestline from '@/i18n/en/bestline'
import enCommon from '@/i18n/en/common'
import enDartboard from '@/i18n/en/dartboard'
import csAi from '@/i18n/cs/aisynthesis'
import enAi from '@/i18n/en/aisynthesis'
import csSweep from '@/i18n/cs/mysteriouscorrelation'
import enSweep from '@/i18n/en/mysteriouscorrelation'
import csDrug from '@/i18n/cs/miracledrug'
import enDrug from '@/i18n/en/miracledrug'
import csDoctor from '@/i18n/cs/doctormortality'
import enDoctor from '@/i18n/en/doctormortality'
import csRegion from '@/i18n/cs/interestingregion'
import enRegion from '@/i18n/en/interestingregion'

async function setLanguage(language: 'cs' | 'en') {
  await act(async () => {
    await i18n.changeLanguage(language)
  })
}

beforeEach(() => {
  window.location.hash = '#/'
  missingInterpolations.length = 0
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

  it('lists every scenario as implemented, now that the sequence is finished', async () => {
    await setLanguage('en')
    render(<App />)
    expect(screen.getAllByText(enCommon.status.available)).toHaveLength(7)
    expect(screen.queryAllByText(enCommon.status.planned)).toHaveLength(0)
  })

  it('shows a notice for an address that is not a scenario', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/08-not-a-scenario'
    render(<App />)
    expect(screen.getByText(enCommon.scenario.notFound.body)).toBeDefined()
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

describe('doctor mortality scenario', () => {
  it('walks through the lifecycle in both languages', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/04-doctor-mortality'
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: enDoctor.intro.heading })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enDoctor.intro.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enDoctor.experiment.heading }),
    ).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enDoctor.experiment.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enDoctor.observation.heading }),
    ).toBeDefined()

    await setLanguage('cs')
    expect(
      screen.getByRole('heading', { level: 2, name: csDoctor.observation.heading }),
    ).toBeDefined()
  })

  it('will not go on to the analysis until a doctor has been chosen', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/04-doctor-mortality'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enDoctor.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enDoctor.experiment.action }))

    const advance = screen.getByRole('button', { name: enDoctor.observation.action })
    expect(advance.hasAttribute('disabled')).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: enDoctor.observation.autoWorst }))
    expect(
      screen.getByRole('button', { name: enDoctor.observation.action }).hasAttribute('disabled'),
    ).toBe(false)
    expect(screen.getAllByText(enDoctor.analysis.verdictStriking).length).toBeGreaterThan(0)
  })

  it('separates case mix from the search, and validates on a later year', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/04-doctor-mortality'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enDoctor.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enDoctor.experiment.action }))
    fireEvent.click(screen.getByRole('button', { name: enDoctor.observation.autoWorst }))
    fireEvent.click(screen.getByRole('button', { name: enDoctor.observation.action }))

    // Both corrections are offered, in order, on the analysis stage.
    expect(screen.getByText(enDoctor.analysis.adjustment.heading)).toBeDefined()
    expect(screen.getByText(enDoctor.analysis.selection.heading)).toBeDefined()
    // The doctor named in advance still has nothing to report.
    expect(screen.getAllByText(enDoctor.analysis.verdictNothing).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: enDoctor.analysis.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enDoctor.validation.heading }),
    ).toBeDefined()
    // The legend must say that what is on screen is a new, independent year.
    expect(screen.getAllByText(enDoctor.validation.freshYear).length).toBeGreaterThan(0)
  })
})

describe('miracle drug scenario', () => {
  it('walks through the lifecycle in both languages', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/05-miracle-drug'
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: enDrug.intro.heading })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enDrug.intro.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enDrug.experiment.heading }),
    ).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enDrug.experiment.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enDrug.observation.heading }),
    ).toBeDefined()

    await setLanguage('cs')
    expect(
      screen.getByRole('heading', { level: 2, name: csDrug.observation.heading }),
    ).toBeDefined()
  })

  it('will not go on to the analysis until an outcome has been chosen', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/05-miracle-drug'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enDrug.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enDrug.experiment.action }))

    const advance = screen.getByRole('button', { name: enDrug.observation.action })
    expect(advance.hasAttribute('disabled')).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: enDrug.observation.autoBest }))
    expect(
      screen.getByRole('button', { name: enDrug.observation.action }).hasAttribute('disabled'),
    ).toBe(false)
    expect(screen.getAllByText(enDrug.analysis.verdictStriking).length).toBeGreaterThan(0)
  })

  it('offers both corrections, and validates in a new trial', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/05-miracle-drug'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enDrug.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enDrug.experiment.action }))
    fireEvent.click(screen.getByRole('button', { name: enDrug.observation.autoBest }))
    fireEvent.click(screen.getByRole('button', { name: enDrug.observation.action }))

    expect(screen.getByText(enDrug.analysis.textbook.heading)).toBeDefined()
    expect(screen.getByText(enDrug.analysis.selection.heading)).toBeDefined()
    // The registered outcome still has nothing to report.
    expect(screen.getAllByText(enDrug.analysis.verdictNothing).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: enDrug.analysis.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enDrug.validation.heading }),
    ).toBeDefined()
    // The legend must say that what is on screen is a new, independent trial.
    expect(screen.getAllByText(enDrug.validation.freshTrial).length).toBeGreaterThan(0)
  })
})

describe('rendered text', () => {
  it('leaves no interpolation placeholder unfilled, including behind the simulations', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/05-miracle-drug'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enDrug.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enDrug.experiment.action }))
    fireEvent.click(screen.getByRole('button', { name: enDrug.observation.autoBest }))
    fireEvent.click(screen.getByRole('button', { name: enDrug.observation.action }))

    // The panels that only appear once a simulation has finished are exactly
    // where a forgotten value survives review.
    fireEvent.click(screen.getByRole('button', { name: /Simulate the search/ }))
    await waitFor(
      () => expect(screen.getByText(enDrug.analysis.selection.adjusted)).toBeDefined(),
      { timeout: 10_000 },
    )

    fireEvent.click(screen.getByRole('button', { name: enDrug.analysis.action }))
    fireEvent.click(screen.getByRole('button', { name: /Run 200 trials/ }))

    expect(missingInterpolations).toEqual([])
    expect(document.body.textContent ?? '').not.toContain('{{')
  }, 20_000)
})

describe('mysterious correlation scenario', () => {
  it('walks through the lifecycle in both languages', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/06-mysterious-correlation'
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: enSweep.intro.heading })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enSweep.intro.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enSweep.experiment.heading }),
    ).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enSweep.experiment.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enSweep.observation.heading }),
    ).toBeDefined()

    await setLanguage('cs')
    expect(
      screen.getByRole('heading', { level: 2, name: csSweep.observation.heading }),
    ).toBeDefined()
  })

  it('hides the discoveries until the sweep is run, then requires one to be chosen', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/06-mysterious-correlation'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enSweep.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enSweep.experiment.action }))

    // Nothing to choose from before the analyst has run.
    expect(screen.queryByText(enSweep.observation.discoveries)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: enSweep.observation.runSweep }))
    expect(screen.getByText(enSweep.observation.discoveries)).toBeDefined()

    const advance = screen.getByRole('button', { name: enSweep.observation.action })
    expect(advance.hasAttribute('disabled')).toBe(true)

    // The first row of the ranked list is the strongest pair the sweep found.
    fireEvent.click(screen.getAllByRole('button', { name: /^Variables \d+ and \d+/ })[0])
    expect(
      screen.getByRole('button', { name: enSweep.observation.action }).hasAttribute('disabled'),
    ).toBe(false)
    expect(screen.getAllByText(enSweep.analysis.verdictStriking).length).toBeGreaterThan(0)
  })

  it('shows the whole sweep, not only its winner, and validates on new rows', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/06-mysterious-correlation'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enSweep.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enSweep.experiment.action }))
    fireEvent.click(screen.getByRole('button', { name: enSweep.observation.runSweep }))
    fireEvent.click(screen.getAllByRole('button', { name: /^Variables \d+ and \d+/ })[0])
    fireEvent.click(screen.getByRole('button', { name: enSweep.observation.action }))

    expect(screen.getByText(enSweep.analysis.sweep.heading)).toBeDefined()
    expect(screen.getByText(enSweep.analysis.selection.heading)).toBeDefined()
    // The pair named in advance still has nothing to report.
    expect(screen.getAllByText(enSweep.analysis.verdictNothing).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: enSweep.analysis.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enSweep.validation.heading }),
    ).toBeDefined()
    expect(screen.getAllByText(enSweep.validation.freshBatch).length).toBeGreaterThan(0)
  })
})

describe('ai synthesis scenario', () => {
  it('walks through the lifecycle in both languages', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/07-ai-synthesis'
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: enAi.intro.heading })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enAi.intro.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enAi.experiment.heading }),
    ).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: enAi.experiment.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enAi.observation.heading }),
    ).toBeDefined()

    await setLanguage('cs')
    expect(
      screen.getByRole('heading', { level: 2, name: csAi.observation.heading }),
    ).toBeDefined()
  })

  it('keeps which finalist is real hidden until the data decide it', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/07-ai-synthesis'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enAi.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enAi.experiment.action }))

    // Nothing on the observation stage may say which is which.
    expect(screen.queryByText(enAi.features.connected)).toBeNull()
    expect(screen.queryByText(enAi.features.unconnected)).toBeNull()

    // And a guess is required before going on.
    const advance = screen.getByRole('button', { name: enAi.observation.action })
    expect(advance.hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getAllByRole('button', { name: /^Feature \d+$/ })[0])
    expect(
      screen.getByRole('button', { name: enAi.observation.action }).hasAttribute('disabled'),
    ).toBe(false)
  })

  it('reveals the answer only at the validation stage', async () => {
    await setLanguage('en')
    window.location.hash = '#/scenario/07-ai-synthesis'
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: enAi.intro.action }))
    fireEvent.click(screen.getByRole('button', { name: enAi.experiment.action }))
    fireEvent.click(screen.getAllByRole('button', { name: /^Feature \d+$/ })[0])
    fireEvent.click(screen.getByRole('button', { name: enAi.observation.action }))

    // The analysis stage prices the search and still says nothing.
    expect(screen.getByText(enAi.analysis.selection.heading)).toBeDefined()
    expect(screen.queryByText(enAi.features.connected)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: enAi.analysis.action }))
    expect(
      screen.getByRole('heading', { level: 2, name: enAi.validation.heading }),
    ).toBeDefined()
    expect(screen.getAllByText(enAi.features.connected).length).toBeGreaterThan(0)
    expect(screen.getByText(enAi.validation.intervention.heading)).toBeDefined()
  })
})
