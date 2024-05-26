import React, { useState, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { View } from './View';
import { NavButtons } from './NavButtons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from "../common/util/iconUtils";
import { Flex } from './Flex';
import { Logo } from './Logo';
import analisoLogo from '../assets/img/logos/analiso-logo-principal-secondary-color.webp'
import { NavOptions } from './NavOptions';

// Lazy load do Modal
const Modal = lazy(() => import('./Modal'));

const NavbarStyled = styled.nav`
  display: flex;
  align-items: left;
  margin-left: 4rem; 
  height: 6rem;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;

  .menu-button {
    font-size: 1.8rem;
    background: none;
    border: none;
  }
`;

export const Navbar: React.FC = () => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [animationModal, setAnimationModal] = useState<boolean>(false);
  const modalWidthsArray = { "desktop": 0, "tablet": 0, "mobile": 22 };

  const openModal = () => {
    setIsOpenModal(true);
    setAnimationModal(true);
  }

  return (
    <NavbarStyled>
      <View $view="desktop" $width='100%'>
        <Flex $direction='row' $justify='space-between'>
          <NavOptions />
          <NavButtons />
        </Flex>
      </View>
      <View $view="mobile" $width='100%'>
        <Flex $direction={'column'} $align={'end'}>
          <button onClick={openModal} type='button' className='menu-button'>
            <FontAwesomeIcon icon={faBars} />
          </button>
          <Suspense fallback={<div>Loading...</div>}>
            {isOpenModal && (
              <Modal
                $zindex="2"
                $closeactionprop={() => setIsOpenModal(false)}
                $isopen={isOpenModal}
                $animation={animationModal}
                $animationactionprop={() => setAnimationModal(false)}
                $modalwidths={modalWidthsArray}
              >
                <Flex $direction={'column'} $align='start'>
                  <Logo src={analisoLogo} />
                  <NavOptions />
                </Flex>
                <NavButtons />
              </Modal>
            )}
          </Suspense>
        </Flex>
      </View>
    </NavbarStyled>
  );
};
