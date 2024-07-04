import React from 'react';
import styled from 'styled-components';
import media from '../../common/styles/MediaScreens';

interface FoldProps {
    children: React.ReactNode;
    $backgroundcolor: string;
    $height?: string;
}

const FoldStyled = styled.div<FoldProps>`
    background-color: ${(props) => props.$backgroundcolor};
    height: ${(props) => props.$height ?? '60rem'};
    padding-inline: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fill;
    flex-direction: row;

    ${media.mobile} { 
        justify-content: start;
        align-items: start;
        padding-inline: 2rem; 
        padding-top: 3rem;
        flex-direction: column;
        height: ${(props) => props.$height ?? '50rem'};
    }
`;

const Fold: React.FC<FoldProps> = ({ children, $backgroundcolor, $height }) => (
  <FoldStyled $height={$height} $backgroundcolor={$backgroundcolor}>
    {children}
  </FoldStyled>
);

export default Fold;
