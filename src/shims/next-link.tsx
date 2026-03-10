import { forwardRef, type AnchorHTMLAttributes } from "react";

type NextLikeLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
};

const Link = forwardRef<HTMLAnchorElement, NextLikeLinkProps>(function Link(
  { href, children, ...props },
  ref,
) {
  return (
    <a ref={ref} href={href} {...props}>
      {children}
    </a>
  );
});

export default Link;
