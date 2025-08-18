import { ForgottenPasswordChangeForm } from '@/components/forgotten-password-change-form';
import React from 'react'

const page = () => {
  return (
    (<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <ForgottenPasswordChangeForm/>
      </div>
    </div>)
  );
}

export default page