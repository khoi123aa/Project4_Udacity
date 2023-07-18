import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-typ5undi2m3q6uqs.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  logger.info("Verifying token: ")
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  if (!jwt) {
    logger.error("JWT decoded token not found")

    throw new Error("Unauthorized access")
  }

  try {
    const certificate = await getCertificate();
    const verifiedToken = verify(token, certificate, {algorithms: ["RS256"]}) as JwtPayload
    logger.info("Authenticated token: ", verifiedToken)

    return verifiedToken
  } catch (e) {
    logger.error("Unable to authenticate", e);
  }
  return undefined
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

const getCertificate = async (): Promise<string> => {
  const response = await Axios.get(jwksUrl)
  const keys = response.data.keys

  if (keys?.length) {
    const signinKeys = keys.filter(key => {
      return key.use === "sig" && key.kty === "RSA" && key.alg === "RS256" && key.n && key.e && key.kid && (key.x5c && key.x5c.length)
    })

    return `-----BEGIN CERTIFICATE-----\\n${signinKeys[0].x5c[0]}\\n-----END CERTIFICATE-----\\n`
  }

  throw new Error("Invalid authentication token");
}
