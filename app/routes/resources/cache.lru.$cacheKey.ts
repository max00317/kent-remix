import type {DataFunctionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import invariant from 'tiny-invariant'
import {lruCache} from '~/utils/cache.server'
import {
  ensureInstance,
  getAllInstances,
  getInstanceInfo,
} from '~/utils/fly.server'
import {requireAdminUser} from '~/utils/session.server'

export async function loader({request, params}: DataFunctionArgs) {
  await requireAdminUser(request)
  const searchParams = new URL(request.url).searchParams
  const currentInstanceInfo = getInstanceInfo()
  const allInstances = await getAllInstances()
  const instance =
    searchParams.get('instance') ?? currentInstanceInfo.currentInstance
  await ensureInstance(instance)

  const {cacheKey} = params
  invariant(cacheKey, 'cacheKey is required')
  return json({
    instance: {
      hostname: instance,
      region: allInstances[instance],
      isPrimary: currentInstanceInfo.primaryInstance === instance,
    },
    cacheKey,
    value: lruCache.get(cacheKey),
  })
}
