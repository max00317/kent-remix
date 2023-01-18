import type {User} from '~/types'
import * as ck from '../convertkit/convertkit.server'
import {getImageBuilder, images} from '../images'
import {cache, cachified, lruCache} from './cache.server'
import * as discord from './discord.server'
import {getAvatar, getOptionalTeam} from './misc'
import type {Timings} from './timing.server'

type UserInfo = {
  avatar: {
    src: string
    alt: string
    hasGravatar: boolean
  }
  convertKit: {
    tags: Array<{id: string; name: string}>
  } | null
  discord: {
    username: string
  } | null
}

async function gravatarExistsForEmail({
  email,
  request,
  timings,
  forceFresh,
}: {
  email: string
  request: Request
  timings?: Timings
  forceFresh?: boolean
}) {
  return cachified({
    key: `gravatar-exists-for:${email}`,
    cache: lruCache,
    request,
    timings,
    forceFresh,
    ttl: 1000 * 20,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 365,
    checkValue: prevValue => typeof prevValue === 'boolean',
    getFreshValue: async () => {
      const gravatarUrl = getAvatar(email, {fallback: '404'})
      try {
        const avatarResponse = await fetch(gravatarUrl, {method: 'HEAD'})
        return avatarResponse.status === 200
      } catch {
        // 🤷‍♂️
        return false
      }
    },
  })
}

async function getDirectAvatarForUser(
  {email, team}: Pick<User, 'email' | 'team'>,
  {
    size = 128,
    request,
    timings,
    forceFresh,
  }: {size: number; request: Request; timings?: Timings; forceFresh?: boolean},
) {
  const hasGravatar = await gravatarExistsForEmail({
    email,
    request,
    timings,
    forceFresh,
  })
  if (hasGravatar) {
    return {hasGravatar, avatar: getAvatar(email, {size, fallback: null})}
  } else {
    const imageProfileIds = {
      RED: images.kodyProfileRed.id,
      BLUE: images.kodyProfileBlue.id,
      YELLOW: images.kodyProfileYellow.id,
      UNKNOWN: images.kodyProfileWhite.id,
    }
    return {
      hasGravatar,
      avatar: getImageBuilder(imageProfileIds[getOptionalTeam(team)])({
        resize: {
          type: 'pad',
          width: size,
          height: size,
        },
      }),
    }
  }
}

const getConvertKitCacheKey = (convertKitId: string) =>
  `convertkit:${convertKitId}`
const getDiscordCacheKey = (discordId: string) => `discord:${discordId}`

async function getUserInfo(
  user: User,
  {
    request,
    forceFresh,
    timings,
  }: {request: Request; forceFresh?: boolean; timings?: Timings},
) {
  const {discordId, convertKitId, email} = user
  const [discordUser, convertKitInfo] = await Promise.all([
    discordId
      ? cachified({
          cache,
          request,
          timings,
          forceFresh,
          ttl: 1000 * 60 * 60 * 24 * 30,
          staleWhileRevalidate: 1000 * 60 * 60 * 24 * 30,
          key: getDiscordCacheKey(discordId),
          checkValue: (value: unknown) =>
            typeof value === 'object' && value !== null && 'id' in value,
          getFreshValue: async () => {
            const result = await discord.getDiscordUser(discordId)
            return result
          },
        })
      : null,
    convertKitId
      ? cachified({
          cache,
          request,
          timings,
          forceFresh,
          ttl: 1000 * 60 * 60 * 24 * 30,
          staleWhileRevalidate: 1000 * 60 * 60 * 24 * 30,
          key: getConvertKitCacheKey(convertKitId),
          checkValue: (value: unknown) =>
            typeof value === 'object' && value !== null && 'tags' in value,
          getFreshValue: async () => {
            const subscriber = await ck.getConvertKitSubscriber(email)
            if (!subscriber) {
              return {
                tags: [],
              }
            }
            const tags = await ck.getConvertKitSubscriberTags(subscriber.id)
            return {
              tags: tags.map(({name, id}) => ({name, id})),
            }
          },
        })
      : null,
  ])

  const {avatar, hasGravatar} = await getDirectAvatarForUser(user, {
    size: 128,
    request,
    timings,
  })
  const userInfo: UserInfo = {
    avatar: {
      src: avatar,
      alt: user.firstName,
      hasGravatar,
    },
    discord: discordUser,
    convertKit: convertKitInfo,
  }
  return userInfo
}

async function deleteConvertKitCache(convertKitId: string | number) {
  await cache.delete(getConvertKitCacheKey(String(convertKitId)))
}

async function deleteDiscordCache(discordId: string) {
  await cache.delete(getDiscordCacheKey(discordId))
}

export {
  getUserInfo,
  deleteConvertKitCache,
  deleteDiscordCache,
  getDirectAvatarForUser,
}
