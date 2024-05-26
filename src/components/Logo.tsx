import React from 'react';
import styled from 'styled-components';
import media from '../common/styles/MediaScreens';

interface LogoProps {
  size?: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  src: string;
}

const LogoStyled = styled.img<LogoProps>`
  width: ${(props) => props.size?.desktop ?? '8rem'};

  ${media.tablet} {
    width: ${(props) => props.size?.tablet ?? '8rem'};
  }

  ${media.mobile} { 
    width: ${(props) => props.size?.mobile ?? '12rem'};
  }
`;

export const Logo: React.FC<LogoProps> = ({ size, src }) => {
  return <LogoStyled alt='Logo' src={src} size={size} />;
};
