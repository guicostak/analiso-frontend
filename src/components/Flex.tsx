import React from 'react';
import styled from 'styled-components';

interface FlexProps {
    children: any;
    $direction: string;
    $align?: string;
    $justify?: string;
    $width?: string;
    $height?: string;
}

const FlexStyled = styled.div<FlexProps>`
    display: flex;
    flex-direction:  ${(props) => props.$direction};
    align-items: ${(props) => props.$align ?? "center"};
    justify-content:  ${(props) => props.$justify ?? "center"};
    height: ${(props) => props.$height ?? "100%"};
    width: ${(props) => props.$width ?? "100%"};
`;

export const Flex: React.FC<FlexProps> = ({ children, $justify, $align, $direction, $width, $height }) => {
  return (
    <FlexStyled $justify={$justify} $align={$align} $direction={$direction} $width={$width} $height={$height}>
      {children}
    </FlexStyled>
  );
};
