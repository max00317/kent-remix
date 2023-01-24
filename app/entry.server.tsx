import {
  Response,
  type HandleDataRequestFunction,
  type HandleDocumentRequestFunction,
} from '@remix-run/node'
import {RemixServer} from '@remix-run/react'
import cookie from 'cookie'
import isbot from 'isbot'
import {renderToPipeableStream} from 'react-dom/server'
import {PassThrough} from 'stream'
import {routes as otherRoutes} from './other-routes.server'
import {getEnv} from './utils/env.server'
import {
  getFlyReplayResponse,
  getInstanceInfo,
  getTXNumber,
} from './utils/fly.server'
import {NonceProvider} from './utils/nonce-provider'

if (process.env.NODE_ENV === 'development') {
  try {
    require('./refresh.ignored')
  } catch {
    // ignore
  }
}

global.ENV = getEnv()

const ABORT_DELAY = 5000

// NOTE: we've got a patch-package on Remix that adds the loadContext argument
// so we can access the cspNonce in the entry. Hopefully this gets supported:
// https://github.com/remix-run/remix/discussions/4603
type DocRequestArgs = Parameters<HandleDocumentRequestFunction>

export default async function handleRequest(...args: DocRequestArgs) {
  const [
    request,
    responseStatusCode,
    responseHeaders,
    remixContext,
    loadContext,
  ] = args
  if (responseStatusCode >= 500) {
    // maybe we're just in trouble in this region... if we're not in the primary
    // region, then replay and hopefully it works next time.
    const {currentIsPrimary, primaryInstance} = getInstanceInfo()
    if (!currentIsPrimary) {
      console.error(
        `Replaying request in ${process.env.FLY_REGION} to primary instance (${primaryInstance}) because of error`,
      )
      return getFlyReplayResponse(primaryInstance)
    }
  }

  for (const handler of otherRoutes) {
    // eslint-disable-next-line no-await-in-loop
    const otherRouteResponse = await handler(request, remixContext)
    if (otherRouteResponse) return otherRouteResponse
  }

  if (process.env.NODE_ENV !== 'production') {
    responseHeaders.set('Cache-Control', 'no-store')
  }

  responseHeaders.append(
    'Link',
    '<https://res.cloudinary.com>; rel="preconnect"',
  )

  // If the request is from a bot, we want to wait for the full
  // response to render before sending it to the client. This
  // ensures that bots can see the full page content.
  if (isbot(request.headers.get('user-agent'))) {
    return serveTheBots(
      request,
      responseStatusCode,
      responseHeaders,
      remixContext,
      loadContext,
    )
  }

  return serveBrowsers(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext,
    loadContext,
  )
}

function serveTheBots(...args: DocRequestArgs) {
  const [
    request,
    responseStatusCode,
    responseHeaders,
    remixContext,
    loadContext,
  ] = args
  const nonce = loadContext.cspNonce ? String(loadContext.cspNonce) : undefined
  return new Promise((resolve, reject) => {
    const stream = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </NonceProvider>,
      {
        nonce,
        // Use onAllReady to wait for the entire document to be ready
        onAllReady() {
          responseHeaders.set('Content-Type', 'text/html')
          const body = new PassThrough()
          stream.pipe(body)
          resolve(
            new Response(body, {
              status: responseStatusCode,
              headers: responseHeaders,
            }),
          )
        },
        onShellError(err: unknown) {
          reject(err)
        },
      },
    )
    setTimeout(() => stream.abort(), ABORT_DELAY)
  })
}

function serveBrowsers(...args: DocRequestArgs) {
  const [
    request,
    responseStatusCode,
    responseHeaders,
    remixContext,
    loadContext,
  ] = args
  const nonce = loadContext.cspNonce ? String(loadContext.cspNonce) : undefined
  return new Promise((resolve, reject) => {
    let didError = false
    const stream = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </NonceProvider>,
      {
        nonce,
        // use onShellReady to wait until a suspense boundary is triggered
        onShellReady() {
          responseHeaders.set('Content-Type', 'text/html')
          const body = new PassThrough()
          stream.pipe(body)
          resolve(
            new Response(body, {
              status: didError ? 500 : responseStatusCode,
              headers: responseHeaders,
            }),
          )
        },
        onShellError(err: unknown) {
          reject(err)
        },
        onError(err: unknown) {
          didError = true
          console.error(err)
        },
      },
    )
    setTimeout(() => stream.abort(), ABORT_DELAY)
  })
}

export async function handleDataRequest(
  response: Response,
  {request}: Parameters<HandleDataRequestFunction>[1],
) {
  const {currentIsPrimary, primaryInstance} = getInstanceInfo()
  if (response.status >= 500) {
    // maybe we're just in trouble in this instance... if we're not in the primary
    // instance, then replay and hopefully it works next time.
    if (!currentIsPrimary) {
      console.error(
        `Replaying request in ${process.env.FLY_REGION} to primary instance (${primaryInstance}) because of error`,
      )
      return getFlyReplayResponse(primaryInstance)
    }
  }

  if (request.method === 'POST') {
    if (currentIsPrimary) {
      const txnum = await getTXNumber()
      if (txnum) {
        response.headers.append(
          'Set-Cookie',
          cookie.serialize('txnum', txnum.toString(), {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
          }),
        )
      }
    }
  }

  return response
}
