import { SearchIcon } from "lucide-react";
import { Form, useLocation, useNavigate, useSearchParams } from "@remix-run/react";
import { Input } from "./input";
import { Button } from "./button";
import FlexRow from "./flex-row";

interface Props {
  inputPlaceholder?: string;
}

export default function TableSearch({ inputPlaceholder }: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Form method="get" className="w-full">
      <FlexRow className="gap-2">
        <Input
          type="search"
          name="search"
          className="max-w-lg"
          defaultValue={searchParams.get("search") || ""}
          placeholder={inputPlaceholder || "Search..."}
          onChange={(event) => {
            const value = event.currentTarget.value;
            const searchParams = new URLSearchParams();
            searchParams.set("search", value);
            const path = `${location.pathname}?${searchParams.toString()}`;
            navigate(path, { replace: true });
          }}
        />
        <Button type="submit" title="Search" aria-label="Search" disabled={false}>
          <SearchIcon />
        </Button>
      </FlexRow>
    </Form>
  );
}
