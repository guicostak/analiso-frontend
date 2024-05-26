import React from 'react';
import styled from 'styled-components';
import media from '../common/styles/MediaScreens';

interface TituloProps {
    $textcolor: string;
    children: React.ReactNode;
}

const TituloStyled = styled.h1<TituloProps>`
    font-size: 3.6rem;
    font-weight: 700;
    color: ${(props) => props.$textcolor};

    ${media.mobile} {
      margin-bottom: 1rem;
      font-size: 1.8rem;
    }
`;

export const Titulo: React.FC<TituloProps> = ({ children, $textcolor }) => {
  return (
    <TituloStyled $textcolor={$textcolor}>
      {children}
    </TituloStyled>
  );
};
