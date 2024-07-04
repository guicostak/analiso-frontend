const sizes = {
  mobile: 767,
  tablet: 1023,
};

const media = {
  mobile: `@media (max-width: ${sizes.mobile}px)`,
  tablet: `@media (min-width: ${sizes.mobile + 1}px) and (max-width: ${sizes.tablet}px)`,
};

export default media;
