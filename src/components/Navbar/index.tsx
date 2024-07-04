import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import View from '../View';
import NavButtons from '../NavButtons';
import { faBars } from '../../common/util/imports/iconUtilsImports';
import Flex from '../Flex';
import Logo from '../Logo';
import analisoLogo from '../../assets/img/logos/analiso-logo-principal-secondary-color.webp';
import NavOptions from '../NavOptions';
import Modal from '../Modal';
import { OpenModalBtn } from './styles';

const NavbarStyled = styled.nav`
  display: flex;
  align-items: left;
  margin-left: 4rem; 
  height: 6rem;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
`;

const Navbar: React.FC = () => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [animationModal, setAnimationModal] = useState<boolean>(false);
  const modalWidthsArray = { desktop: 0, tablet: 0, mobile: 22 };

  const openModal = () => {
    setIsOpenModal(true);
    setAnimationModal(true);
  };

  return (
    <NavbarStyled>
      <View $view="desktop tablet" $width="100%">
        <Flex $direction="row" $justify="space-between" $wrap="wrap">
          <NavOptions />
          <NavButtons />
        </Flex>
      </View>
      <View $view="mobile" $width="100%">
        <Flex $direction="column" $align="end">
          <OpenModalBtn onClick={openModal} type="button" className="menu-button" aria-label="Open menu">
            <FontAwesomeIcon icon={faBars} />
          </OpenModalBtn>
          <Modal
            $zindex="2"
            $closeactionprop={() => setIsOpenModal(false)}
            $isopen={isOpenModal}
            $animation={animationModal}
            $animationactionprop={() => setAnimationModal(false)}
            $modalwidths={modalWidthsArray}
          >
            <Flex $direction="column" $align="start">
              <Logo src={analisoLogo} />
              <NavOptions />
            </Flex>
            <NavButtons />
          </Modal>
        </Flex>
      </View>
    </NavbarStyled>
  );
};

export default Navbar;
