import { useActions, useValues } from 'kea'

import { LemonButton } from '@posthog/lemon-ui'

import { sessionRecordingSavedFiltersLogic } from 'scenes/session-recordings/filters/sessionRecordingSavedFiltersLogic'

import { RecordingUniversalFilters, SessionRecordingPlaylistType } from '~/types'

import { savedFilterName, savedFilterToFilters } from './savedFilterApply'

// A handful of quick picks. The select beside them lists every saved filter.
const MAX_CHIPS = 4

/** One-click saved filters beside the select, like a video site's topic chips next to its search bar. */
export function SavedFilterChips({
    setFilters,
}: {
    setFilters: (filters: Partial<RecordingUniversalFilters>) => void
}): JSX.Element | null {
    const { savedFilters, appliedSavedFilter } = useValues(sessionRecordingSavedFiltersLogic)
    const { setAppliedSavedFilter } = useActions(sessionRecordingSavedFiltersLogic)

    if (savedFilters.results.length === 0) {
        return null
    }

    const apply = (filter: SessionRecordingPlaylistType): void => {
        const next = savedFilterToFilters(filter)
        if (!next) {
            return
        }
        setFilters(next)
        setAppliedSavedFilter(filter)
    }

    return (
        <>
            {savedFilters.results.slice(0, MAX_CHIPS).map((filter) => (
                <LemonButton
                    key={filter.short_id}
                    size="small"
                    type="secondary"
                    active={filter.short_id === appliedSavedFilter?.short_id}
                    onClick={() => apply(filter)}
                    className="max-w-60"
                    truncate
                    data-attr="list-saved-filter-chip"
                >
                    {savedFilterName(filter)}
                </LemonButton>
            ))}
        </>
    )
}
