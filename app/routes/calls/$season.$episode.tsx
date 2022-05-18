import * as React from 'react'
import type {LoaderFunction} from '@remix-run/node';
import { redirect} from '@remix-run/node'
import type {KCDHandle} from '~/types'
import {getEpisodes} from '~/utils/transistor.server'
import {getEpisodeFromParams, getEpisodePath} from '~/utils/call-kent'

export const handle: KCDHandle = {
  getSitemapEntries: () => null,
}

export const loader: LoaderFunction = async ({params, request}) => {
  const {season, episode: episodeParam} = params
  if (!season || !episodeParam) {
    throw new Error('params.season or params.episode is not defined')
  }
  const episodes = await getEpisodes({request})
  const episode = getEpisodeFromParams(episodes, {
    season,
    episode: episodeParam,
  })

  if (!episode) {
    return redirect('/calls')
  }

  // the slug doesn't really matter.
  // The unique identifier is the season and episode numbers.
  // But we'll redirect to the correct slug to make the URL nice.
  return redirect(getEpisodePath(episode))
}

export default function Screen() {
  return <div>You should have been redirected... Weird</div>
}
