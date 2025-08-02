'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'
import { Suspense } from 'react'

export const ProgressProvider = ({ children }) => {
    return (
        <>
            {children}
            <Suspense>
                <ProgressBar
                    height="4px"
                    color="hsl(var(--primary))"
                    options={{ showSpinner: false }}
                    shallowRouting
                />
            </Suspense>
        </>
    )
}
