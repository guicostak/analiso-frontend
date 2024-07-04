import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../common/styles/Theme';
import Logo from '../Logo';
import Navbar from '../Navbar';
import analisoLogo from '../../assets/img/logos/analiso-logo-principal-secondary-color.webp';
import media from '../../common/styles/MediaScreens';

const HeaderStyled = styled.header`
  background-color: ${Theme.primaryColor};
  height: 6rem;
  display: flex;
  align-items: center;
  padding-inline: 2rem;
  
  ${media.tablet} {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 10rem;
    padding-block: 1rem;
    padding-inline: 3rem;
  }

  ${media.mobile} {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Header: React.FC = () => (
  <HeaderStyled>
    <Logo src={analisoLogo} />
    <Navbar />
  </HeaderStyled>
);

export default Header;
