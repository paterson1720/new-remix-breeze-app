export default function InternalServerError({ message }: { message: string }) {
  return (
    <section className="bg-white h-screen grid place-items-center dark:bg-slate-950">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
            500
          </h1>
          <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
            Internal Server Error.
          </p>
          <p className="mb-4 font-light text-lg text-gray-500 dark:text-gray-400">
            We are already working to fix the issue.
          </p>
          <p className="mb-4 font-light text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </section>
  );
}
