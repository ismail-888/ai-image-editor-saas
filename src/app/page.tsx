import React from 'react'
import { env } from '~/env'

export default function HomePage() {
  return (
    <div className='text-2xl text-red-500 font-bold'>{env.BETTER_AUTH_URL}</div>
  )
}
