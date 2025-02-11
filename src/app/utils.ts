import dayjs from 'dayjs'

export const formatDate = (date?: string) => {
  if (!date) return null
  return dayjs(date).format('MMM DD, YYYY')
}
