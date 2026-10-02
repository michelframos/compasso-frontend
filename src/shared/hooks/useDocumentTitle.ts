import { useEffect } from 'react'
import { useMatches } from 'react-router-dom'
import { APP_NAME } from '@/shared/constants/app'

export type RouteHandle = {
  title?: string
}

export const useDocumentTitle = () => {
  const matches = useMatches()
  const pageTitle = [...matches]
    .reverse()
    .map((match) => (match.handle as RouteHandle | undefined)?.title)
    .find(Boolean)

  useEffect(() => {
    document.title = pageTitle ? `${APP_NAME} | ${pageTitle}` : APP_NAME
  }, [pageTitle])
}
