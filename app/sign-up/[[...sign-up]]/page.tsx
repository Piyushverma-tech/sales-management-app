import { SignUp } from '@clerk/nextjs';
const SignUpPage = () => {
  return (
    <div className={`w-full h-screen flex justify-center items-center`}>
      <SignUp fallbackRedirectUrl="/dashboard" />
    </div>
  );
};

export default SignUpPage;
