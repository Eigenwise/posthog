import { RecordingUniversalFilters, SessionRecordingPlaylistType } from '~/types'

import { stripSessionIds } from './playlistUtils'
import { asUniversalFilters } from './sessionRecordingsPlaylistLogic'

export const savedFilterName = (filter: SessionRecordingPlaylistType): string =>
    filter.name || filter.derived_name || 'Unnamed'

/** The list filters a saved filter stands for, or null when it holds no usable filters. */
export function savedFilterToFilters(filter: SessionRecordingPlaylistType): RecordingUniversalFilters | null {
    const universal = asUniversalFilters(filter.filters)
    return universal ? stripSessionIds(universal) : null
}
