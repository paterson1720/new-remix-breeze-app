import { Link } from "@remix-run/react";

type ToastType = "success" | "error" | "info" | "warning";
type toastData = { type: ToastType; message: string } | null | undefined;

/**
 * BreezeToastViewer is a custom viewer for the @remi-breeze/toast library.
 * @example
 * const location = useLocation();
 * const { pathname, search, hash } = location;
 * const currentHref = `${pathname}${search}${hash}`;
 *
 * return (
 *  <BreezeToastViewer
 *   toastData={data?.toastData || null}
 *   onCloseRedirectTo={currentHref}
 *   />
 * );
 */

export function BreezeToastViewer({
  toastData,
  onCloseRedirectTo,
}: {
  toastData: toastData;
  onCloseRedirectTo: string;
}) {
  if (!toastData) return null;

  return (
    <div>
      {toastData.type && toastData.message && (
        <Toast
          type={toastData.type}
          message={toastData.message}
          onCloseRedirectTo={onCloseRedirectTo}
        />
      )}
    </div>
  );
}

function Toast({
  type,
  message,
  onCloseRedirectTo,
}: {
  type: ToastType;
  message: string;
  onCloseRedirectTo: string;
}) {
  return (
    <div className="w-full">
      <div
        className={clsx("p-4 rounded-md shadow-md", {
          "bg-green-100 text-green-800": type === "success",
          "bg-red-100 text-red-800": type === "error",
          "bg-blue-100 text-blue-800": type === "info",
          "bg-yellow-100 text-yellow-800": type === "warning",
        })}
      >
        <div className="flex items-center justify-between">
          <div>{message}</div>
          <Link to={onCloseRedirectTo}>
            <X className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function clsx(...classes: (string | boolean | Record<string, boolean>)[]) {
  let finalClasses = "";

  for (const cls of classes) {
    if (typeof cls === "string") finalClasses += cls + " ";
    if (typeof cls === "object") {
      for (const [key, value] of Object.entries(cls)) {
        if (value) finalClasses += key + " ";
      }
    }
  }

  return finalClasses.trim();
}

function X(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="h-4 w-4"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
