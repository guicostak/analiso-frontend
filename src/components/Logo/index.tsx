import media from "../../common/styles/MediaScreens";
import styled from "styled-components";

const Logo = styled.img`
  width: 8rem;
  cursor: pointer;
  transition: 0.3s;
      &:hover {
      transition: 0.3s;
      transform: scale(1.03);
  }

  ${media.tablet} {
    width: 8rem;
  }

  ${media.mobile} { 
    width: 12rem;
  }
`;

export default Logo;