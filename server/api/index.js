import express from 'express'
import Ajv from 'ajv'
import { responses, responseList } from '../responses'
import * as auth from '../auth'
import * as db from '../database'

const router = express.Router()

const routes = [
  require('./leaderboard/now').default,
  require('./leaderboard/graph').default,
  require('./submitflag').default,
  require('./challenges').default,
  require('./integrations-ctftime/leaderboard').default,
  require('./integrations-ctftime/callback').default,
  ...require('./users').default,
  ...require('./auth').default,
  ...require('./admin/challs').default
]

const validationParams = ['body', 'params', 'query']
const routeValidators = routes.map((route) => {
  if (route.schema === undefined) {
    return {}
  }

  const ret = {}
  validationParams.forEach(param => {
    if (route.schema[param] !== undefined) {
      ret[param] = new Ajv().compile(route.schema[param])
    }
  })
  return ret
})

const makeSendResponse = (res) => (responseKind, data = null) => {
  const response = responseList[responseKind]
  if (response === undefined) {
    throw new Error(`unknown response ${responseKind}`)
  }
  res.status(response.status)
  if (response.rawContentType !== undefined) {
    res.set('content-type', response.rawContentType)
    res.send(data)
  } else {
    res.set('content-type', 'application/json')
    res.send(JSON.stringify({
      kind: responseKind,
      message: response.message,
      data
    }))
  }
}

routes.forEach((route, i) => {
  router[route.method](route.path, async (req, res) => {
    const sendResponse = makeSendResponse(res)

    if (req.body instanceof Buffer) {
      try {
        req.body = JSON.parse(req.body)
      } catch (e) {
        sendResponse(responses.badJson)
        return
      }
    }

    let user
    if (route.requireAuth) {
      const authHeader = req.get('authorization')
      if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
        sendResponse(responses.badToken)
        return
      }
      const uuid = await auth.token.getData(auth.token.tokenKinds.auth, authHeader.slice('Bearer '.length))
      if (uuid === null) {
        sendResponse(responses.badToken)
        return
      }

      user = await db.auth.getUserById({
        id: uuid
      })
      if (user == null) {
        sendResponse(responses.badToken)
        return
      }
    }

    if (route.perms !== undefined) {
      if (user === undefined) {
        throw new Error('routes with perms must set requireAuth to true')
      }
      if ((user.perms & route.perms) !== route.perms) {
        sendResponse(responses.badPerms)
        return
      }
    }

    const validator = routeValidators[i]
    const allValid = validationParams.every(param => {
      if (validator[param] !== undefined) {
        return validator[param](req[param])
      }
      return true
    })

    if (!allValid) {
      sendResponse(responses.badBody)
      return
    }

    let response
    try {
      response = await route.handler({
        req,
        user
      })
    } catch (e) {
      sendResponse(responses.errorInternal)
      console.error(e.stack)
    }

    if (response instanceof Array) {
      sendResponse(...response)
    } else {
      sendResponse(response)
    }
  })
})

router.use((req, res) => {
  makeSendResponse(res)(responses.badEndpoint)
})

export default router
