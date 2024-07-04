import React from 'react';
import styled from 'styled-components';
import Theme from '../../common/styles/Theme';
import media from '../../common/styles/MediaScreens';

interface ButtonProps {
  $width?: string;
  $background?: string;
  $textcolor?: string;
  children: React.ReactNode;
  $height?: string;
  $border?: string;
  onClick: () => void;
}

const ButtonStyled = styled.button<ButtonProps>`
  width: ${(props) => props.$width ?? 'auto'};
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 10px;
  border: ${(props) => props.$border ?? 'none'};
  background-color: ${(props) => props.$background ?? Theme.secondaryColor};
  color: ${(props) => props.$textcolor ?? Theme.primaryColor};
  height: ${(props) => props.$height ?? '2.5rem'};
  padding-inline: 1rem;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    transition: 0.3s;
    transform: scale(1.02);
  }

  ${media.mobile} {
    width: 20rem;
    height: 3.2rem;
    font-size: 1rem;
  }
`;

const Button: React.FC<ButtonProps> = ({
  $width,
  $background,
  children,
  $textcolor,
  onClick,
  $height,
  $border,
}) => (
  <ButtonStyled
    $textcolor={$textcolor}
    $width={$width}
    $background={$background}
    onClick={onClick}
    $height={$height}
    $border={$border}
  >
    {children}
  </ButtonStyled>
);

export default Button;
