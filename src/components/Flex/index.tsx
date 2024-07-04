import React from 'react';
import styled from 'styled-components';

interface FlexProps {
    children: React.ReactNode;
    $direction: string;
    $align?: string;
    $justify?: string;
    $width?: string;
    $height?: string;
    $wrap?: string;
}

const FlexStyled = styled.div<FlexProps>`
    display: flex;
    flex-direction:  ${(props) => props.$direction};
    align-items: ${(props) => props.$align ?? 'center'};
    justify-content:  ${(props) => props.$justify ?? 'center'};
    flex-wrap: ${(props) => props.$wrap ?? 'none'};
    height: ${(props) => props.$height ?? '100%'};
    width: ${(props) => props.$width ?? '100%'};
`;

const Flex: React.FC<FlexProps> = ({
  children, $justify, $align, $direction, $width, $height, $wrap,
}) => (
  <FlexStyled $justify={$justify} $align={$align} $direction={$direction} $width={$width} $height={$height} $wrap={$wrap}>
    {children}
  </FlexStyled>
);

export default Flex;
