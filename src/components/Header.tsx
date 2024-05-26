import React from 'react';
import styled from 'styled-components';
import { Theme } from '../common/styles/Theme';
import { Logo } from './Logo';
import { Navbar } from './Navbar';
import analisoLogo from '../assets/img/logos/analiso-logo-principal-secondary-color.webp'
import media from '../common/styles/MediaScreens';

const HeaderStyled = styled.header`
  background-color: ${Theme.primaryColor};
  height: 6rem;
  display: flex;
  align-items: center;
  padding-inline: 2rem;

  ${media.mobile} {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

export const Header: React.FC = () => {

  const logoSizes = {
    mobile: '9rem',
    tablet: '8rem',
    desktop: '10rem'
  };

  return (
    <HeaderStyled>
      <Logo size={logoSizes} src={analisoLogo} />
      <Navbar />
    </HeaderStyled>
  );
};