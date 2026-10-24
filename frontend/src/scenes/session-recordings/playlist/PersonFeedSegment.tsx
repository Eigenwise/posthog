import { BindLogic, useActions, useValues } from 'kea'

import { IconArrowLeft } from '@posthog/icons'
import { LemonButton, Spinner } from '@posthog/lemon-ui'

import { PersonType, SessionRecordingType } from '~/types'

import { PersonIcon } from 'products/persons/frontend/components/PersonDisplay'
import { asDisplay } from 'products/persons/frontend/person-utils'

import { SessionRecordingPreviewCompact } from './SessionRecordingPreviewCompact'
import { SessionRecordingPreviewFeed } from './SessionRecordingPreviewFeed'
import { SessionRecordingPlaylistLogicProps, sessionRecordingsPlaylistLogic } from './sessionRecordingsPlaylistLogic'

/** The person's other recordings, taking over the list column until the viewer goes back. */
export function PersonFeedSegment({
    person,
    currentRecordingId,
    feedCards,
    onBack,
}: {
    person: PersonType
    currentRecordingId: SessionRecordingType['id']
    /** Feed cards in the feed layout, compact rows elsewhere, so the list matches the one it replaces. */
    feedCards: boolean
    onBack: () => void
}): JSX.Element {
    // Read before the inner BindLogic shadows it: the click must land on the list that drives the player.
    const { setSelectedRecordingId } = useActions(sessionRecordingsPlaylistLogic)
    const logicProps: SessionRecordingPlaylistLogicProps = {
        logicKey: `feed-person-${person.uuid}`,
        analyticsSource: 'feed-person',
        personUUID: person.uuid,
        distinctIds: person.distinct_ids,
        autoPlay: false,
        updateSearchParams: false,
    }

    return (
        <BindLogic logic={sessionRecordingsPlaylistLogic} props={logicProps}>
            <PersonFeedList
                person={person}
                currentRecordingId={currentRecordingId}
                feedCards={feedCards}
                onOpen={setSelectedRecordingId}
                onBack={onBack}
            />
        </BindLogic>
    )
}

function PersonFeedList({
    person,
    currentRecordingId,
    feedCards,
    onOpen,
    onBack,
}: {
    person: PersonType
    currentRecordingId: SessionRecordingType['id']
    feedCards: boolean
    onOpen: (id: SessionRecordingType['id']) => void
    onBack: () => void
}): JSX.Element {
    const { otherRecordings, sessionRecordingsResponseLoading, hasNext } = useValues(sessionRecordingsPlaylistLogic)
    const { maybeLoadSessionRecordings } = useActions(sessionRecordingsPlaylistLogic)
    const loading = sessionRecordingsResponseLoading && otherRecordings.length === 0

    return (
        <div
            className="flex flex-col flex-1 min-h-0 border rounded bg-surface-primary overflow-hidden"
            data-attr="feed-person-segment"
        >
            <div className="flex items-center gap-1 pl-1 pr-2 py-1 border-b text-xs ph-no-capture">
                <LemonButton
                    size="xsmall"
                    icon={<IconArrowLeft />}
                    onClick={onBack}
                    tooltip="Back to all recordings"
                    aria-label="Back to all recordings"
                    data-attr="feed-person-back"
                />
                <PersonIcon person={person} size="sm" className="mr-0" />
                <span className="font-medium truncate flex-1">{asDisplay(person)}</span>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0 [scrollbar-gutter:stable] [scrollbar-width:thin]">
                {loading ? (
                    <div className="flex items-center gap-2 text-muted p-4">
                        <Spinner /> Loading…
                    </div>
                ) : otherRecordings.length === 0 ? (
                    <p className="text-muted text-sm p-4 m-0">This is their only recording so far.</p>
                ) : (
                    <>
                        {otherRecordings.map((recording) => (
                            <div key={recording.id} className="border-b" onClick={() => onOpen(recording.id)}>
                                {feedCards ? (
                                    <SessionRecordingPreviewFeed
                                        recording={recording}
                                        isActive={recording.id === currentRecordingId}
                                    />
                                ) : (
                                    <SessionRecordingPreviewCompact
                                        recording={recording}
                                        isActive={recording.id === currentRecordingId}
                                    />
                                )}
                            </div>
                        ))}
                        <div className="h-12 flex items-center justify-center text-secondary text-xs">
                            {sessionRecordingsResponseLoading ? (
                                <Spinner textColored />
                            ) : hasNext ? (
                                <LemonButton
                                    size="xsmall"
                                    data-attr="feed-person-load-older"
                                    onClick={() => maybeLoadSessionRecordings('older')}
                                >
                                    Load more
                                </LemonButton>
                            ) : (
                                'No more recordings'
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
