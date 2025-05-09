'use client' 
 
import { useEffect } from 'react'
 
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <div>
      <h2>Quelque chose s'est mal passé!</h2>
      <button
        onClick={
          () => reset()
        }
      >
        Réessayer
      </button>
    </div>
  )
}