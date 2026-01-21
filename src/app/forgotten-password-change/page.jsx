import { ForgottenPasswordChangeForm } from '@/components/forgotten-password-change-form';
import React, { Suspense } from 'react'

const page = () => {
  return (
    (<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoadingSkeleton/>}>
          <ForgottenPasswordChangeForm/>
        </Suspense>
      </div>
    </div>)
  );
}

function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  );
}

export default page