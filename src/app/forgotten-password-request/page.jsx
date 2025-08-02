import { ForgottenPasswordRequestForm } from '@/components/forgotten-password-request-form';
import React from 'react'

const page = () => {
  return (
    (<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgottenPasswordRequestForm/>
      </div>
    </div>)
  );
}

export default page
