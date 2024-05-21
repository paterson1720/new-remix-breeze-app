import { Link } from "@remix-run/react";
import { ArrowLeftIcon } from "lucide-react";
import { PropsWithChildren } from "react";

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
}

export default function BackLink({ href, children }: PropsWithChildren<Props>) {
  return (
    <Link
      to={href || "#"}
      className="flex items-center space-x-2 text-gray-500 hover:text-gray-600"
    >
      <ArrowLeftIcon className="w-4 h-4" />
      <span>{children}</span>
    </Link>
  );
}
