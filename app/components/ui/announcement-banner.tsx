import { Link } from "@remix-run/react";

interface Props {
  banner: {
    content: string;
    linkUrl: string | null;
    linkText: string | null;
  } | null;
}

export default function AnnouncementBanner({ banner }: Props) {
  if (!banner) return null;

  return (
    <>
      <div className="h-8 hidden md:grid items-center text-white justify-center overflow-scroll px-6 font-medium w-full scrollbar-hidden bg-gradient-to-r from-slate-950 via-blue-800 to-slate-900">
        <span className="w-max block">
          {banner.content}
          {banner.linkUrl && (
            <>
              &nbsp;-&nbsp;
              <Link className="underline font-bold" to={banner.linkUrl}>
                {banner.linkText}
              </Link>
            </>
          )}
        </span>
      </div>

      <div className="overflow-hidden md:hidden bg-gradient-to-r from-slate-950 via-blue-500 to-slate-900">
        <div className="h-8 font-medium w-full animate-scroll">
          <div className="text-white min-w-full w-max p-1 text-center inline-block">
            {banner.content}
            {banner.linkUrl && (
              <>
                &nbsp;-&nbsp;
                <Link className="underline font-bold" to={banner.linkUrl}>
                  {banner.linkText}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
