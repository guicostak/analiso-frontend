import React from 'react';
import styled from 'styled-components';
import media from '../../common/styles/MediaScreens';

interface ViewProps {
    $view: string;
    children: React.ReactNode;
    $width?: string;
}

const ViewStyled = styled.div<ViewProps>`
    display: ${(props) => (props.$view.includes('desktop') ? 'flex' : 'none')};
    align-items: center;
    justify-content: center;
    width: ${(props) => props.$width ?? 'auto'};
    height: 100%;

    ${media.mobile} {
      display: ${(props) => (props.$view.includes('mobile') ? 'flex' : 'none')};
    }

    ${media.tablet} {
      display: ${(props) => (props.$view.includes('tablet') ? 'flex' : 'none')};
    }
`;

const View: React.FC<ViewProps> = ({ children, $view, $width }) => (
  <ViewStyled $view={$view} $width={$width}>
    {children}
  </ViewStyled>
);

export default View;
