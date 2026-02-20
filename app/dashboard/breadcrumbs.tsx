'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function DashboardBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter((segment) => segment !== '')

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-[10px] md:text-[12px] flex flex-wrap">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          const href = `/${segments.slice(0, index + 1).join('/')}`

          // Skip the first "dashboard" segment if it's already represented by the Home link
          if (segment.toLowerCase() === 'dashboard' && index === 0) return null

          const title =
            segment.charAt(0).toUpperCase() +
            segment.slice(1).replace(/-/g, ' ')

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
