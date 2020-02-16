import { request } from './index'

export const login = ({ teamToken }) => {
  return request('POST', '/auth/verify', {
    teamToken
  })
}

export const register = ({ email, name, division }) => {
  return request('POST', '/auth/submit', {
    email,
    name,
    division: Number.parseInt(division),
    register: true
  })
}
