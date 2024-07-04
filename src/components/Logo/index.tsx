import styled from 'styled-components';
import media from '../../common/styles/MediaScreens';

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
