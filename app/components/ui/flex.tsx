import clsx from "clsx";
import { ElementType, PropsWithChildren, ReactNode, forwardRef } from "react";

type Props<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & React.ComponentProps<T>;

export default forwardRef<HTMLDivElement, Props<ElementType>>(function FlexCol(
  { as, children, className, style, ...props },
  ref
) {
  const Component = as || "div";

  return (
    <Component {...props} className={clsx(`gap-4 flex`, className)} style={style} ref={ref}>
      {children}
    </Component>
  );
});
