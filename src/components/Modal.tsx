import React from 'react';
import { css, styled } from "styled-components";
import { Theme } from "../common/styles/Theme";
import media from "../common/styles/MediaScreens";
import { emergeAnimation, disappearAnimation } from "../common/styles/Animations";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from "../common/util/iconUtils";

interface IModalProps {
  $zindex: string;
  children: React.ReactNode;
  $closeactionprop: () => void;
  $isopen: boolean;
  $animation: boolean;
  $animationactionprop: () => void;
  $modalwidths: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  $modalheight?: string;
}

export const ModalStyled = styled.div<IModalProps>`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.325);
  backdrop-filter: blur(2px);
  z-index: ${(props) => props.$zindex};
  overflow-y: hidden;
  display: ${(props) => (props.$isopen ? "flex" : "none")};

  .modal { 
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3vh;
    padding: 2rem 1rem;

    width: ${(props) => props.$modalwidths.desktop}rem;
    position: fixed;
    top: 50%; 
    left: 50%;
    transform: translate(-50%, -50%); 

    height: ${(props) => props.$modalheight};

    z-index: 3; 

    background-color: ${Theme.primaryColor};
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); 

    .close{
        font-size: 1.8rem;
        font-weight: 600;
        cursor: pointer;  
        position: absolute;
        top: 5%; 
        left: 95%;
        transform: translate(-50%, -50%); 
        color: ${Theme.secondaryColor};
        background-color: transparent;
        border: none;
    }

    ${media.tablet} { 
      width: ${(props) => props.$modalwidths.tablet}rem;
      top: 50%;
      left: 50%;
    }

    ${media.mobile} { 
      width: ${(props) => props.$modalwidths.mobile}rem;
      top: 50%;
      left: 50%;
    }

    ${(props) =>
      props.$isopen &&
      css`
        animation: ${emergeAnimation} 0.4s ease;
      `}

    ${(props) =>
      !props.$animation &&
      css`
        animation: ${disappearAnimation} 0.4s ease;
      `}
  }
`;

const Modal: React.FC<IModalProps> = ({
  $zindex: zIndex,
  children,
  $closeactionprop: closeActionProp,
  $isopen: isOpen,
  $animation: animation,
  $animationactionprop: animationactionprop,
  $modalwidths: modalWidths,
  $modalheight: modalHeight
}) => {
  const closeModalLocalMethod = () => {
    animationactionprop();
    setTimeout(() => {
        closeActionProp();
    }, 300);
  };

  return (
    <ModalStyled
      $isopen={isOpen}
      $animation={animation}
      $animationactionprop={animationactionprop}
      $closeactionprop={closeActionProp}
      $zindex={zIndex}
      $modalwidths={modalWidths}
      $modalheight={modalHeight}
    >
      <div className="modal">
        <button type="button" className="close" onClick={closeModalLocalMethod}>
          <FontAwesomeIcon icon={faCircleXmark} />
        </button>
        {children}
      </div>
    </ModalStyled>
  );
};

export default Modal;