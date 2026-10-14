import Banner from "../common/banner";
import LoginForm from "../login/form";
export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Banner />
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <LoginForm />
      </main>
    </div>
  );
}
