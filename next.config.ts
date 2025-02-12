import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_AIRTABLE_API_KEY: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
    NEXT_PUBLIC_AIRTABLE_BASE_ID: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
    NEXT_PUBLIC_AIRTABLE_TABLE_ID: process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID,
  },
}

export default nextConfig
